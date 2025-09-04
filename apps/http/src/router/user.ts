import { Router } from "express";
import { signinController, signupController } from "../controller/authController";

const userRouter: Router = Router();

userRouter.route("/signup").post(signupController);
userRouter.route("/signin/post").get(signinController);

export default userRouter;