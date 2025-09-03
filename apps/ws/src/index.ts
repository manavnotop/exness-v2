import { WebSocketServer } from "ws";
import { subscriber } from "@repo/redis/pubsub"

const wss = new WebSocketServer({ port: 8080 });

( async () => {
  await subscriber.connect();

  await subscriber.subscribe('trade-info', async (message) => {

    wss.clients.forEach((client) => {
      client.send(message);
    })
  })
})()

// wss.on('connection', () => {

// })