import { Request, Response } from "express";
import { SignUpBody } from '@repo/types/zod'
import jwt, { JwtPayload } from "jsonwebtoken"
import "dotenv/config"
import { sendSigninEmail } from "../mail";
import { enginePusher } from "@repo/redis/pubsub";

export const signupController = async (req: Request, res: Response) => {
  const { data, success } = SignUpBody.safeParse(req.body);

  if (!success) {
    return res.status(404).json({
      "message": "invalid input"
    })
  }

  const jwtToken = jwt.sign({
    email: data.email
  }, process.env.JWT_SECRET!)

  console.log(jwtToken);

  await sendSigninEmail(data.email, jwtToken)
  await enginePusher.xAdd("stream:engine", "*", {
    type: "user-add",
    message: JSON.stringify(data)
  })

  return res.status(200).json({
    "message": "sign up successfull"
  })
}

export const signinController = async (req: Request, res: Response) => {
  const token = req.query.token?.toString();

  if (!token) {
    res.status(400).json({
      "message": "token not found"
    })
    return;
  }

  const email = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

  res.cookie("jwt", token);
  res.cookie("email", email);

  res.json({
    message: "login successful"
  })
}