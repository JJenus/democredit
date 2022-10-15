import { Request, Response } from "express";
import { DepositDTO } from "../dto/request/deposit.dto";
import { TransferDTO } from "../dto/request/transfer.dto";
import { WithrawalDTO } from "../dto/request/withdrawal.dto";
import { UserDTO } from "../dto/response/user.dto";
import { depositRepository } from "../repository/deposit.repository";
import { transferRepository } from "../repository/transfer.repository";
import { usersRepository } from "../repository/user.repository";
import { walletRepository } from "../repository/wallet.repository";
import { withdrawalRepository } from "../repository/withdrawal.repositoy";

export const walletController = {
  deposit: async function (req: Request, res: Response) {
    const deposit: DepositDTO = req.body;
    const userId = req.body.userId;
    //storing money as integer: NGN 19.98 = 1998 Kobo
    const amount = deposit.amount * 100;

    const creditWallet = await walletRepository.updateBalance(
      userId,
      amount,
      "increment"
    );

    if (!creditWallet) {
      const depositTransaction = await depositRepository.save(
        userId,
        amount,
        deposit.currencyCode,
        "failed"
      );
      return res
        .status(500)
        .send({ message: "transaction failed", data: depositTransaction });
    }

    // save transaction data
    const depositTransaction = await depositRepository.save(
      userId,
      amount,
      deposit.currencyCode,
      "success"
    );

    return res.status(200).send(depositTransaction);
  },

  withdrawal: async function (req: Request, res: Response) {
    const withrawalRequest: WithrawalDTO = req.body;
    const userId: number = req.body.userId;

    const wallet = await walletRepository.findByUserId(userId);

    //storing money as integer: NGN 19.98 = 1998 Kobo
    const amount = withrawalRequest.amount * 100;

    if (wallet.balance * 100 < amount) {
      return res.status(422).send({
        message: "insufficient balance",
      });
    }

    const debitWallet = await walletRepository.updateBalance(
      userId,
      amount,
      "decrement"
    );

    if (!debitWallet) {
      const withdrawalTransaction = withdrawalRepository.save(
        userId,
        amount,
        withrawalRequest.bank,
        withrawalRequest.accountName,
        withrawalRequest.accountNumber,
        withrawalRequest.currencyCode,
        "failed"
      );

      return res.status(500).send({
        message: "transaction failed",
        data: withdrawalTransaction,
      });
    }

    const withdrawalTransaction = await withdrawalRepository.save(
      userId,
      amount,
      withrawalRequest.bank,
      withrawalRequest.accountName,
      withrawalRequest.accountNumber,
      withrawalRequest.currencyCode,
      "success"
    );

    return res.status(200).send(withdrawalTransaction);
  },

  transfer: async function (req: Request, res: Response) {
    const userId: number = req.body.userId;
    const transfer: TransferDTO = req.body;

    const amount = transfer.amount * 100;

    //retrieve senders wallet
    const wallet = await walletRepository.findByUserId(userId);

    if (!wallet || wallet.balance * 100 < amount) {
      return res.status(422).send({
        message: "insufficient balance",
      });
    }

    //retrieve beneficiary
    const beneficiary: UserDTO = await usersRepository.findByEmail(
      transfer.beneficiary
    );

    if (!beneficiary) {
      return res.status(400).send({
        message: "beneficiary not found",
      });
    }

    //update senders balance
    const debitSender = await walletRepository.updateBalance(
      userId,
      amount,
      "decrement"
    );

    if (!debitSender) {
      return res.status(500).send({
        message: "transaction failed",
      });
    }

    //update receivers balance
    const creditSender = await walletRepository.updateBalance(
      beneficiary.id,
      amount,
      "increment"
    );

    if (!creditSender) {
      //reverse failed transaction
      walletRepository.updateBalance(userId, amount, "increment");
      return res.status(500).send({
        message: "unable to complete transaction",
      });
    }

    // save transaction data
    const transaction = await transferRepository.save(
      userId,
      amount,
      beneficiary.id,
      beneficiary.email,
      transfer.currencyCode
    );

    return res.status(200).send(transaction);
  },
};
