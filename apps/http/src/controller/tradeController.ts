import { Request, Response } from "express";
import { tradePusher } from "@repo/redis/pubsub";
import { responseLoop } from "..";
import { closeOrderSchema, createTradeSchema } from "@repo/types/zod"

export const openTradeController = async (req: Request, res: Response) => {
  const validInput = createTradeSchema.safeParse(req.body);
  const email = (res as unknown as {email: string}).email

  if (!validInput.success) {
    res.status(411).json({
      message: "invalid inputs"
    })
    return;
  }

  const { asset, type, quantity, leverage, slippage, openPrice, decimal } = validInput.data
  const id = Date.now().toString();
  const stimulatedInfo = { email, id, asset, type, quantity, leverage, slippage, openPrice, decimal };

  await tradePusher.xAdd('stream:engine', '*', {
    type: "trade-open",
    message: JSON.stringify(stimulatedInfo)
  })

  try {
    await responseLoop.waitForMessage(id);
    res.json({
      orderId: id
    })
  }
  catch (err) {
    res.status(411).json({
      message: "trade not successful"
    })
  }
}

export const closeTradeController = async (req: Request, res: Response) => {
  const validInput = closeOrderSchema.safeParse(req.body);
  const email = (res as unknown as {email: string}).email

  if(!validInput.success){
    res.status(211).json({
      message: "invalid order id"
    })
    return;
  }
  const id = Date.now().toString();
  const { orderId } = validInput.data;
  const data = { email, id, orderId };

  await tradePusher.xAdd('stream:engine', '*', {
    type: "trade-close", 
    message: JSON.stringify(data)
  })

  try {
    await responseLoop.waitForMessage(id);
    res.json({
      message: "order closed successfully"
    })
  }
  catch(err){ 
    console.log(err);
    res.json({
      message: "error occured while cancelling order"
    })
  }
}