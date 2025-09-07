import { enginePuller, enginePusher } from '@repo/redis/pubsub';
import { handlePriceUpdate } from './priceupdate';
import { handleUserAdd } from './createUser';

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
      console.log(id);
      await enginePusher.xAdd('stream:engine:acknowledgement', "*", {
        type: "trade-acknowledgement",
        id: id
      })
    }
    else if (payload?.type === 'trade-close' && payload.message) {
      //add logic for closing trading and then acknowledge the server
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