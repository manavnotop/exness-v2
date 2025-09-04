import { Request, Response } from "express";
import { SignUpBody } from '@repo/types/zod'
import jwt from "jsonwebtoken"
import "dotenv/config"
import { sendSigninEmail } from "../mail";

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

  return res.status(200).json({
    "message": "sign up successfull"
  })
}