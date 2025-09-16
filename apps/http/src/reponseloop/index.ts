import { httpPuller } from "@repo/redis/pubsub"
import { json } from "express";

export class ResponseLoop {
  private idResponse: Record<string, (data?: any) => void> = {}

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

      if (response && response[0]?.messages[0]?.message) {
        const message = response[0]?.messages[0]?.message;
        
        if (message.type === "trade-open" && message.id) {
          const id = message.id;
          this.idResponse[id]!();
          delete this.idResponse[id];
        }
        else if(message.type === "user-acknowledgement" && message.id){
          const id = message.id;
          this.idResponse[id]!();
          delete this.idResponse[id];
        }
        else if(message.type === "trade-close" && message.id){
          const id = message.id;
          this.idResponse[id]!();
          delete this.idResponse[id];
        }
        else if((message.type === "user-balance-response" || message.type === "asset-balance-response") && message.id){
          const id = message.id;
          const data = message.message ? JSON.parse(message.message) : {};
          this.idResponse[id]!(data);
          delete this.idResponse[id];
        }
        else if((message.type === "user-balance-error" || message.type === "asset-balance-error") && message.id){
          const id = message.id;
          const errorMessage = message.message || "Unknown error";
          this.idResponse[id]!(new Error(errorMessage));
          delete this.idResponse[id];
        }
      }
    }
  }

  waitForMessage(callbackId: string) {
    return new Promise<any>((resolve, reject) => {
      this.idResponse[callbackId] = (data?: any) => {
        if (data instanceof Error) {
          reject(data);
        } else {
          resolve(data);
        }
      };
      setTimeout(() => {
        if (this.idResponse[callbackId]) {
          delete this.idResponse[callbackId];
          reject(new Error("Timeout"));
        }
      }, 3500);
    })
  }
}