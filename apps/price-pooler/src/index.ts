import { WebSocket } from 'ws';
import "dotenv/config"
import { publisher, PricePoolerStreamClient } from '@repo/redis/pubsub'
import { BackpackDataType, FilteredData } from '@repo/types/types'

let filteredDataArray: FilteredData[] = [];

const ws = new WebSocket(process.env.WS_URL!);

(async () => (
  await publisher.connect()
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
    asset_name: data.s,
    ask_price,
    bid_price,
    decimal: 4
  }

  filteredDataArray.push(filteredData);

  setInterval(() => {
    console.log(filteredDataArray);
    filteredDataArray.forEach(async (trade) => {
      await publisher.publish("trade-info", JSON.stringify(trade));
      await PricePoolerStreamClient.xAdd('price:update', "*", {
        message: JSON.stringify(filteredData)
      });
    })
    filteredDataArray = [];
  }, 100);
}