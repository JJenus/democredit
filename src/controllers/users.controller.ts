import { Request, Response } from "express";
import { usersRepository } from "../repository/user.repository";
import { walletRepository } from "../repository/wallet.repository";
import { depositRepository } from "../repository/deposit.repository";
import { transferRepository } from "../repository/transfer.repository";
import { withdrawalRepository } from "../repository/withdrawal.repositoy";

export const userController = {
  getUser: async function (req: Request, res: Response) {
    const id: number = Number(req.params.id);

    const user = await usersRepository.findById(id);
    if (user) {
      return res.status(200).send(user);
    }

    return res.status(404).send({
      message: "user not found",
    });
  },

  getUserWallet: async function (req: Request, res: Response) {
    const id: number = Number(req.params.id);

    if (req.body.userId !== id) {
      return res.status(403).send({
        message: "wrong user id",
      });
    }

    const wallet = await walletRepository.findByUserId(id);

    if (!wallet) {
      // 500 because wallet is supposed to be auto created on registration
      return res.status(500).send({ message: "wallet not found" });
    }

    return res.status(200).send(wallet);
  },

  getUserDeposits: async function (req: Request, res: Response) {
    const id: number = Number(req.params.id);
    const deposits = await depositRepository.findByUserId(id);
    return res.status(200).send(deposits);
  },

  getUserTransfers: async function (req: Request, res: Response) {
    const id: number = Number(req.params.id);
    const transfers = await transferRepository.findByUserId(id);
    return res.status(200).send(transfers);
  },

  getUserWithdrawals: async function (req: Request, res: Response) {
    const id: number = Number(req.params.id);
    const withdrawals = await withdrawalRepository.findByUserId(id);
    return res.status(200).send(withdrawals);
  },
};
