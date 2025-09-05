import { WebSocketServer } from "ws";
import client from "@repo/redis/pubsub"

const wss = new WebSocketServer({ port: 8080 });

( async () => {
  await client.connect();

  await client.subscribe('trade-info', async (message) => {

    wss.clients.forEach((client) => {
      client.send(message);
    })
  })
})()