import { httpPuller } from "@repo/redis/pubsub"

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

      if(!reponse){
        continue;
      }

      const { messages } = reponse[0];
      console.log(messages[0].message.id);
      this.idResponse[messages[0].message.id]();
      delete this.idResponse[messages[0].message.id];
    }
  }

  waitForMessage(callbackId: string){
    return new Promise((resolve, reject) => {
      this.idResponse[callbackId] = resolve;
      setTimeout(() => {
        if(this.idResponse[callbackId]){
          reject;
        }
      }, 5000);
    })
  }
}