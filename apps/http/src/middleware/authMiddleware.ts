import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import "dotenv/config"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log("middleware");
  
  const token = req.cookies.jwt;

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as string;

  if(!decoded){
    res.json(411).json({
      message: "user not authenticated"
    })
  }

  (res as unknown as {email: string}).email = decoded;
  next(); 
}