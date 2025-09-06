import { httpPuller } from "@repo/redis/pubsub"
import { json } from "express";

export class ResponseLoop {
  private idResponse: Record<string, () => void> = {}

  constructor() {
    httpPuller.connect();
    this.loop();
  }

  async loop(){
    while(1){
      const reponse = await httpPuller.xRead({
        key: 'stream:engine:acknowledgement',
        id: "$",
      }, {
        BLOCK: 0,
        COUNT: 1
      })

      if(reponse){
        if(reponse[0]?.messages[0]?.message.type === "trade-acknowledgement" && reponse[0].messages[0].message.message){
          const id = JSON.parse(reponse[0].messages[0].message.message).id;
          this.idResponse[id]!();
          delete this.idResponse[id];
        }
      }
    }
  }

  waitForMessage(callbackId: string){
    return new Promise<void>((resolve, reject) => {
      this.idResponse[callbackId] = resolve;
      setTimeout(() => {
        if(this.idResponse[callbackId]){
          delete this.idResponse[callbackId];
          reject();
        }
      }, 5000);
    })
  }
}