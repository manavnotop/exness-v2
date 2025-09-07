import { enginePuller, enginePusher } from '@repo/redis/pubsub';
import { handlePriceUpdate } from './priceupdate';
import { handleCloseTrade, handleOpenTrade, handleUserAdd } from './createuser';
import { Trade } from '@repo/types/types';

(async () => {
  enginePuller.connect();
  enginePusher.connect();

  while (true) {
    const response = await enginePuller.xRead({
      key: 'stream:engine', id: "$"
    }, {
      BLOCK: 0,
      COUNT: 1
    }
    )

    if (!response) {
      continue;
    }

    const payload = response[0]?.messages[0]?.message;

    if (payload?.type === 'trade-open' && payload.message) {
      const tradeInfo = JSON.parse(payload.message)
      const id = tradeInfo.id;
      const email = tradeInfo.email.email;
      const data: Trade = {
        id: tradeInfo.id,
        asset: tradeInfo.asset,
        type: tradeInfo.type,
        quantity: tradeInfo.quantity,
        leverage: tradeInfo.leverage,
        slippage: tradeInfo.slippage,
        openPrice: tradeInfo.openPrice,
        decimal: tradeInfo.decimal
      }
      await handleOpenTrade(email, data, id)
    }
    else if (payload?.type === 'trade-close' && payload.message) {
      //add logic for closing trading and then acknowledge the server
      console.log(payload.message);
      const data = JSON.parse(payload.message);
      console.log("email: ", data.email.email);
      console.log("id: ", data.id);
      console.log("orderid: ", data.orderId);
      await handleCloseTrade(data.email.email, data.orderId, data.id);
    }
    else if (payload?.type === 'price-update' && payload.message) {
      //console.log('reached price update');
      const data = JSON.parse(payload.message);
      await handlePriceUpdate(data);
    }
    else if (payload?.type === 'user-add' && payload.message) {
      await handleUserAdd(payload.message);
    }
  }
})()