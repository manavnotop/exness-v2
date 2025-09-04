import { Router } from "express";
import { signupController } from "../controller/authController";

const userRouter: Router = Router();

userRouter.route("/signup").post(signupController);

export default userRouter;