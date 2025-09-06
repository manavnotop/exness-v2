import { Request, Response } from "express";
import { tradePusher} from "@repo/redis/pubsub";
import { responseLoop } from "..";

export const openTradeController = async (req: Request, res: Response) => {

  const id = Date.now().toString();

  const stimulatedInfo = {id, type: 'sell', asset: 'SOL'};

  await tradePusher.xAdd('stream:engine', '*', {
    type: "trade",
    message : JSON.stringify(stimulatedInfo)
  })

  try{
    const response = await responseLoop.waitForMessage(id);

    res.json({
      message: "order placed"
    })
  }
  catch(err){

  }

  res.json({
    message: "trade opened successfully"
  })
}