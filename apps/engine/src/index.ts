import { enginePuller }  from '@repo/redis/pubsub';

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

  while(true){
    const response = await enginePuller.xRead(
      { key: 'stream:engine', id: "$"},
      {
        BLOCK: 0,
        COUNT: 1
      }
    )

    if(response){
      if(response[0]?.messages[0]?.message.type === 'trade'){
        console.log(response[0].messages[0].message.type)
      }
    }
  }
})()