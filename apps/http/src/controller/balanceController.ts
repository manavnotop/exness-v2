import { tradePusher } from "@repo/redis/pubsub";
import { json, Request, Response } from "express";
import { responseLoop } from "..";

export const getAssestBalanceController = async (req: Request, res: Response) => {
  const email = (res as unknown as {email: string}).email
  const id = Date.now().toString();

  const data = { email, id };

  try{
    await tradePusher.xAdd('stream:engine', '*', {
      type: "get-asset-balance", 
      message: JSON.stringify(data)
    })

    const response = await responseLoop.waitForMessage(id);

    res.json({
      'asset-balance': response
    })
  }
  catch(error){
    res.status(411).json({
      message: `could not get the asset balance, ${error}`,
      error
    })
  }
}

export const getUsdBalanceController = async (req: Request, res: Response) => {
  const email = (res as unknown as {email: string}).email;
  const id = Date.now().toString();

  const data = { email, id };

  try{
    await tradePusher.xAdd('stream:engine', '*', {
      type: "get-user-balance",
      message: JSON.stringify(data)
    })

    const response = await responseLoop.waitForMessage(id);

    res.json({
      "user balance": response,
    })
  } 
  catch(error){
    res.status(411).json({
      message: `could not get user balance, ${error}`,
    })
  }
}