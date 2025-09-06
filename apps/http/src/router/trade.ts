import { Router } from "express";
import { closeTradeController, openTradeController } from "../controller/tradeController";
import { authMiddleware } from "../middleware/authMiddleware";

export const tradeRouter: Router = Router();

tradeRouter.use(authMiddleware);
tradeRouter.route('/open').post(openTradeController);
tradeRouter.route('/close').post(closeTradeController);