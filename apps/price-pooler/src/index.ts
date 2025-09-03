import { WebSocket } from 'ws';
import "dotenv/config"

const ws = new WebSocket(process.env.WS_URL!);

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
  const data = JSON.parse(event.data.toString());
  console.log(data);
}