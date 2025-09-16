import { PriceStore, Trade } from "@repo/types/types";
import { users } from "./createuser";
import { enginePusher } from "@repo/redis/pubsub";

export let prices: PriceStore = {};

export async function handlePriceUpdate(update: PriceStore) {

  Object.assign(prices, update);

  if (!users) {
    console.log("No users found");
    return;
  }

  for (const [email, user] of Object.entries(users)) {
    if (!user || !user.openTrades) {
      continue;
    }

    const openTrades = user.openTrades;
    
    for (let i = 0; i < openTrades.length; i++) {
      const trade = openTrades[i];
      
      if (!trade) {
        continue;
      }
      
      let assetPrice: number;
      let priceChange: number;
      let pnl: number;

      const assetData = prices[trade.asset as keyof typeof prices];
      if (!assetData) {
        console.log(`Price data not available for asset ${trade.asset}`);
        continue;
      }

      if (trade.type === "long") {
        assetPrice = assetData.bid_price;
        priceChange = assetPrice - trade.openPrice;
      } else {
        assetPrice = assetData.ask_price;
        priceChange = trade.openPrice - assetPrice;
      }

      pnl = (priceChange * trade.leverage * trade.quantity) / Math.pow(10, assetData.decimal);

      const margin = (trade.openPrice * trade.quantity) / Math.pow(10, assetData.decimal);
      const lossTakingCapacity = margin / trade.leverage;

      if (pnl < -0.9 * lossTakingCapacity) {
        const newBalChange = pnl + margin;

        if (users[email]) {
          users[email].balance = users[email].balance + newBalChange;
        }

        if (users[email] && users[email].openTrades) {
          users[email].openTrades.splice(i, 1);
          i--;
        }

        const closedTrade = {
          ...trade,
          closePrice: assetPrice,
          pnl: pnl,
          decimal: assetData.decimal,
          liquidated: true,
        };

        await enginePusher.xAdd('stream:engine:acknowledgement', "*", {
          type: "trade-liquidated",
          email: email,
          trade: JSON.stringify(closedTrade)
        });

        console.log(`Trade liquidated for user ${email}:`, closedTrade);
      }
    }
  }
}