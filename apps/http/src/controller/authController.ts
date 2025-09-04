import { Request, Response } from "express";
import { SignUpBody } from '@repo/types/zod'

export const signupController = async (req: Request, res: Response) => {
  const validInput = SignUpBody.safeParse(req.body);

  if(!validInput.success){
    return res.status(404).json({
      "message": "invalid input"
    })
  }
  
  return res.status(200).json({
    "email": validInput.data.email
  })
}