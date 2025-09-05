import client  from '@repo/redis/pubsub';

(async () => {
  client.connect();
})()

let prices = {
  BTC: 1000,
  SOL: 1000,
  ETH: 1000,
}

let balances = {

}

let openOrders = {

}