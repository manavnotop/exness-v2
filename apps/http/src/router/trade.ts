import { Router } from "express";
import { openTradeController } from "../controller/tradeController";

export const tradeRouter: Router = Router();

tradeRouter.route('/open').post(openTradeController);