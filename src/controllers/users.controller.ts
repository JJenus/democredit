import { Router, Request, Response } from "express";
import knex from "../database/connection";
import { DepositTransaction } from "../dto/response/depositTransaction.dto";
import { TransferTransactionDTO } from "../dto/response/transferTransaction.dto";
import { Wallet } from "../dto/response/wallet.dto";
import { WithdrawalTransactionDTO } from "../dto/response/withdrawalTransaction.dto";
import { JWT } from "../security/jwt";

const users = Router();
const userRepo = knex("users");

users.get("/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(id);
  userRepo
    .select(["id", "name", "email"])
    .where("id", id)
    .then((users: any) => {
      res.json(users[0]);
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: false,
        message: err.message,
      });
    });
});

users.get("/:id/wallet", async (req: Request, res: Response) => {
  const authToken = req.headers.authorization.split(" ")[1];
  const user = JWT.getUser(authToken);

  //its safer to get user id from token
  const id: number = Number(req.params.id);

  if (user.id !== id) {
    return res.status(403).send({
      message: "wrong user id",
    });
  }
  const wallet: Wallet = await knex<Wallet>("wallets")
    .select()
    .where("user_id", id)
    .then((wallets: any) => {
      return wallets[0];
    })
    .catch((err) => {
      console.log(err);
      return null;
    });

  return res.status(200).send(wallet);
});

users.get("/:id/transfers", async (req: Request, res: Response) => {
  const authToken = req.headers.authorization.split(" ")[1];
  const user = JWT.getUser(authToken);

  //its safer to get user id from token
  const id: number = Number(req.params.id);

  if (user.id !== id) {
    return res.status(403).send({
      message: "wrong user id",
    });
  }

  const transfers: TransferTransactionDTO[] = await knex<
    TransferTransactionDTO[]
  >("transfers")
    .select()
    .where("sender_id", id)
    .then((transactions: any[]) => {
      return transactions.map((data) => {
        const transaction: TransferTransactionDTO = {
          senderId: data.sender_id,
          beneficiaryId: data.beneficiary_id,
          beneficiaryEmail: data.beneficiary_email,
          amount: data.amount / 100, //setting amount from e.g 950 kobo to NGN 9.50
          currencyCode: data.currency_code,
          status: data.status,
          transactionId: data.transaction_id,
          createdAt: data.created_at,
        };

        return transaction;
      });
    })
    .catch((err) => {
      console.log(err);
      return null;
    });

  return res.status(200).send(transfers);
});

users.get("/:id/deposits", async (req: Request, res: Response) => {
  const authToken = req.headers.authorization.split(" ")[1];
  const user = JWT.getUser(authToken);

  //its safer to get user id from token
  const id: number = Number(req.params.id);

  if (user.id !== id) {
    return res.status(403).send({
      message: "wrong user id",
    });
  }

  const deposits: DepositTransaction[] = await knex<DepositTransaction[]>(
    "deposits"
  )
    .select()
    .where("user_id", id)
    .then((transactions: any[]) => {
      return transactions.map((data) => {
        const transaction: DepositTransaction = {
          userId: data.user_id,
          amount: data.amount / 100, //setting amount from e.g 950 kobo to NGN 9.50
          currencyCode: data.currency_code,
          status: data.status,
          transactionId: data.transaction_id,
          createdAt: data.created_at,
        };

        return transaction;
      });
    })
    .catch((err) => {
      console.log(err);
      return null;
    });

  return res.status(200).send(deposits);
});

users.get("/:id/withdrawals", async (req: Request, res: Response) => {
  const authToken = req.headers.authorization.split(" ")[1];
  const user = JWT.getUser(authToken);

  //its safer to get user id from token
  const id: number = Number(req.params.id);

  if (user.id !== id) {
    return res.status(403).send({
      message: "wrong user id",
    });
  }

  const deposits: WithdrawalTransactionDTO[] = await knex<
    WithdrawalTransactionDTO[]
  >("withdrawals")
    .select()
    .where("user_id", id)
    .then((transactions: any[]) => {
      return transactions.map((data) => {
        const transaction: WithdrawalTransactionDTO = {
          userId: data.user_id,
          amount: data.amount / 100,
          accountNumber: data.account_number,
          accountName: data.account_name,
          bank: data.bank,
          currencyCode: data.currency_code,
          status: data.status,
          transactionId: data.transaction_id,
          createdAt: data.created_at,
        };

        return transaction;
      });
    })
    .catch((err) => {
      console.log(err);
      return null;
    });

  return res.status(200).send(deposits);
});

export default users;
