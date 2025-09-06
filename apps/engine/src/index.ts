import { enginePuller, enginePusher } from '@repo/redis/pubsub';

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

    if(!response){
      continue;
    }

    if(response[0]?.messages[0]?.message.type === 'trade' && response[0].messages[0].message.message){
      const tradeInfo = JSON.parse(response[0].messages[0].message.message)
      const id = tradeInfo.id;
      console.log(id);
      await enginePusher.xAdd('stream:engine:acknowledgement', "*", {
        id: id
      })
    }
    else{
      const priceUpdateInfo = JSON.parse(response[0]?.messages[0]?.message.message!);
      //console.log(priceUpdateInfo);
    }
  }
})()