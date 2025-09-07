import { httpPuller } from "@repo/redis/pubsub"
import { json } from "express";

export class ResponseLoop {
  private idResponse: Record<string, () => void> = {}

  constructor() {
    httpPuller.connect();
    this.loop();
  }

  async loop() {
    while (1) {
      const response = await httpPuller.xRead({
        key: 'stream:engine:acknowledgement',
        id: "$",
      }, {
        BLOCK: 0,
        COUNT: 1
      })

      if (response) {

        if (response[0]?.messages[0]?.message.type === "trade-open" && response[0].messages[0].message.id) {
          const id = (response[0].messages[0].message.id);
          this.idResponse[id]!();
          delete this.idResponse[id];
        }
        else if(response[0]?.messages[0]?.message.type === "user-acknowledgement" && response[0].messages[0].message.id){
          const id = response[0].messages[0].message.id;
          this.idResponse[id]!();
          delete this.idResponse[id];
        }
      }
    }
  }

  waitForMessage(callbackId: string) {
    return new Promise<void>((resolve, reject) => {
      this.idResponse[callbackId] = resolve;
      setTimeout(() => {
        if (this.idResponse[callbackId]) {
          delete this.idResponse[callbackId];
          reject();
        }
      }, 3500);
    })
  }
}