import { Router } from "express";
import { walletController } from "../controllers/wallet.controller";
import { validateRequest } from "../middlewares/requestValidation";

const wallets = Router();

wallets.post("/deposit", validateRequest.deposit, walletController.deposit);

wallets.post("/withdraw", validateRequest.withdrawal, walletController.withdrawal);

wallets.post("/transfer", validateRequest.transfer, walletController.transfer);

export default wallets;
