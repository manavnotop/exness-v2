import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getAssestBalanceController, getUsdBalanceController } from "../controller/balanceController";

const balanceRouter: Router = Router();

balanceRouter.use(authMiddleware);
balanceRouter.get('/', getAssestBalanceController);
balanceRouter.get('/usd', getUsdBalanceController);

export default balanceRouter;