import { CLOSING, WebSocket } from 'ws';
import "dotenv/config"
import  client  from '@repo/redis/pubsub'
import { BackpackDataType, FilteredData, PriceUpdate } from '@repo/types/types'

let lastDate = Date.now();

let priceUpdates: PriceUpdate = {
    SOL: {
      ask_price: 0,
      bid_price: 0,
      decimal: 4
    },
    BTC: {
      ask_price: 0,
      bid_price: 0,
      decimal: 4
    },
    ETH: {
      ask_price: 0,
      bid_price: 0,
      decimal: 4
    },
  }


const ws = new WebSocket(process.env.WS_URL!);

(async () => (
  await client.connect()
))()

ws.onopen = () => {
  console.log('socket connected');

  ws.send(
    JSON.stringify({
      "method": "SUBSCRIBE",
      "params": [
        "bookTicker.SOL_USDC_PERP",
        "bookTicker.ETH_USDC_PERP",
        "bookTicker.BTC_USDC_PERP"
      ],
    })
  )
}

ws.onmessage = async (event) => {
  const data: BackpackDataType = JSON.parse(event.data.toString()).data;
  const ask = Number(data.a).toFixed(4);
  const ask_int_string = ask.split('.')[0] + ask.split('.')[1]!
  const ask_price = Number(ask_int_string);

  const bid = Number(data.b).toFixed(4);
  const bid_int_string = bid.split('.')[0] + bid.split('.')[1]!
  const bid_price = Number(bid_int_string);

  const filteredData: FilteredData = {
    ask_price,
    bid_price,
    decimal: 4
  }

  if(data.s === "SOL_USDC_PERP"){
    priceUpdates.SOL = filteredData;
  }
  else if(data.s === "ETH_USDC_PERP"){
    priceUpdates.ETH = filteredData
  }
  else {
    priceUpdates.BTC = filteredData
  }
  console.log(priceUpdates);

  if(Date.now() - lastDate > 100 ){
    await client.publish("trade-info", JSON.stringify(priceUpdates));
    await client.xAdd("price:update", "*", {
      message: JSON.stringify(priceUpdates)
    })
    lastDate = Date.now();
  }
}