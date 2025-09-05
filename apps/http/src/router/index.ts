import { Router } from "express";
import userRouter from "./user";
import { tradeRouter } from "./trade";

const router: Router = Router();

router.use("/auth", userRouter)
router.use("/trade", tradeRouter);

export default router;