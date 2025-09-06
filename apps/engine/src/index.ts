import { enginePuller, enginePusher } from '@repo/redis/pubsub';
import { handleUserAdd } from './createUser';

let prices = {
  BTC: 1000,
  SOL: 1000,
  ETH: 1000,
}

let balances = {

}

let openOrders = {

};


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
      //add logic for updating price for local object
    }
    else if (payload?.type === 'user-add' && payload.message) {
      console.log('reached engine');
      await handleUserAdd(payload.message)
    }
  }
})()