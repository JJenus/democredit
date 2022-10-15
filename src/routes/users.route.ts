import { Router } from "express";
import { userController } from "../controllers/users.controller";

const users = Router();

users.get("/:id", userController.getUser);

users.get("/:id/wallet", userController.getUserWallet);

users.get("/:id/withdrawals", userController.getUserWithdrawals);

users.get("/:id/deposits", userController.getUserDeposits);

users.get("/:id/transfers", userController.getUserTransfers);

export default users;