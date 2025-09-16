import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import "dotenv/config"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (!token) {
    console.log("No JWT token found in cookies");
    return res.status(411).json({
      message: "user not authenticated - token missing"
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const email = decoded.email;
    
    (res as unknown as {email: string}).email = email;
    
    if (!req.cookies.email) {
      console.log("Setting email cookie");
      res.cookie("email", email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }
    
    next();
  } catch (error) {
    console.log("JWT verification failed:", error);
    return res.status(411).json({
      message: "user not authenticated - invalid token"
    })
  }
}