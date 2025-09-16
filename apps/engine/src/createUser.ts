import { Trade, UserStore } from "@repo/types/types";
import { enginePusher } from "@repo/redis/pubsub";
import { prices } from "./priceupdate";

export let users: UserStore = {

}

function createUser(email: string) {
  return {
    email: email,
    balance: 5000,
    openTrades: []
  }
}

export async function handleUserAdd(message: string) {
  try {
    const data = JSON.parse(message);
    const email = data.email;
    const id = data.id;

    if (!email) {
      console.log('email missing');
      return;
    }

    if (!users[email]) {
      users[email] = createUser(email);
      console.log('user created');
    }
    else {
      console.log('user already exists');
    }

    await enginePusher.xAdd('stream:engine:acknowledgement', "*", {
      type: "user-acknowledgement",
      id: id
    })
    console.log(users);
  }
  catch (error) {
    console.log(error);
  }
}

export async function handleOpenTrade(email: string, trade: Trade, id: string) {
  let user = users[email];

  if (!user) {
    console.log(`User ${email} not found`);
    return;
  }
  console.log("reach - 1");

  const assetCurrentPrice = prices[trade.asset as keyof typeof prices];
  if (!assetCurrentPrice) {
    await enginePusher.xAdd("stream:engine:acknowledgement", "*", {
      type: "trade-open-err",
      id: id,
      response: JSON.stringify({
        message: `Price not available for asset ${trade.asset}`,
      }),
    });
    return;
  }

  const feedAsk = assetCurrentPrice.ask_price / Math.pow(10, assetCurrentPrice.decimal);
  const feedBid = assetCurrentPrice.bid_price / Math.pow(10, assetCurrentPrice.decimal);
  const clientOpen = trade.openPrice / Math.pow(10, trade.decimal);

  let openPrice: number;
  let priceDiff: number;

  if (trade.type === "long") {
    openPrice = feedAsk;
    priceDiff = Math.abs(feedAsk - clientOpen);
  } else {
    openPrice = feedBid;
    priceDiff = Math.abs(feedBid - clientOpen);
  }

  const priceDiffPercent = (priceDiff / clientOpen) * 100;
  console.log("clientOpen:", clientOpen, "feedAsk:", feedAsk, "feedBid:", feedBid, "priceDiffPercent:", priceDiffPercent, "slippage:", trade.slippage);



  if (priceDiffPercent > trade.slippage) {
    await enginePusher.xAdd("stream:engine:acknowledgement", "*", {
      type: "trade-open-err",
      id: id,
      response: JSON.stringify({
        message: "Price slippage exceeded",
      }),
    });
    return;
  }

  const margin = (openPrice * trade.quantity)

  console.log("reach - 3");
  const currentBalance = user.balance;
  console.log("current balance", currentBalance)
  const newBal = currentBalance - margin;
  console.log("new balance", newBal)
  if (newBal < 0) {
    await enginePusher.xAdd("stream:engine:acknowledgement", "*", {
      type: "trade-open-err",
      id: id,
      response: JSON.stringify({
        message: "User does not have enough balance",
      }),
    });
    return;
  }

  const order: Trade = {
    id: trade.id,
    asset: trade.asset,
    type: trade.type,
    quantity: trade.quantity,
    leverage: trade.leverage,
    slippage: trade.slippage,
    openPrice: openPrice, 
    decimal: trade.decimal,
  };

  console.log("reach - 4");
  user.openTrades.push(order);
  user.balance = newBal;

  await enginePusher.xAdd("stream:engine:acknowledgement", "*", {
    type: "trade-open",
    id: id,
  });

  console.log("Order created:", order);
  console.log("User balance updated:", user.balance);
}


export async function handleCloseTrade(email: string, orderId: string, id: string) {
  const user = users[email];
  if (!user) {
    await enginePusher.xAdd("stream:engine:acknowledgement", "*", {
      type: "trade-close-err",
      id,
      response: JSON.stringify({ message: "User not found" }),
    });
    return;
  }

  const tradeIndex = user.openTrades.findIndex((t) => t.id === orderId);
  if (tradeIndex === -1) {
    await enginePusher.xAdd("stream:engine:acknowledgement", "*", {
      type: "trade-close-err",
      id,
      response: JSON.stringify({ message: "Order not found" }),
    });
    return;
  }

  const order = user.openTrades[tradeIndex]!;
  const assetCurrentPrice = prices[order.asset as keyof typeof prices];
  if (!assetCurrentPrice) {
    await enginePusher.xAdd("stream:engine:acknowledgement", "*", {
      type: "trade-close-err",
      id,
      response: JSON.stringify({ message: `Price not available for ${order.asset}` }),
    });
    return;
  }

  const decimalFactor = Math.pow(10, assetCurrentPrice.decimal);
  const feedAsk = assetCurrentPrice.ask_price / decimalFactor;
  const feedBid = assetCurrentPrice.bid_price / decimalFactor;

  const closePrice = order.type === "long" ? feedBid : feedAsk;

  const priceChange =
    order.type === "long" ? closePrice - order.openPrice : order.openPrice - closePrice;

  const pnl = priceChange * order.quantity * order.leverage;
  const pnlRounded = Number(pnl.toFixed(assetCurrentPrice.decimal));

  const margin = order.openPrice * order.quantity;

  user.balance += pnlRounded + margin;

  user.openTrades.splice(tradeIndex, 1);

  const closedOrder = {
    ...order,
    closePrice, 
    pnl: pnlRounded,
    liquidated: false,
  };

  await enginePusher.xAdd("stream:engine:acknowledgement", "*", {
    type: "trade-close",
    id,
  });

  console.log("Order closed:", closedOrder);
  console.log("User balance updated:", user.balance);
}

