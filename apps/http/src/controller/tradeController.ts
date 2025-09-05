import { Request, Response } from "express";
import { tradePusher} from "@repo/redis/pubsub";

export const openTradeController = async (req: Request, res: Response) => {

  const id = Date.now().toString();

  const stimulatedInfo = {id, type: 'sell', asset: 'SOL'};

  await tradePusher.xAdd('stream:engine', '*', {
    type: "trade",
    message : JSON.stringify(stimulatedInfo)
  })



  res.json({
    message: "trade opened successfully"
  })
}