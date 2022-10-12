import { Response, Request, Router } from "express";
import moment = require("moment");
import knex from "../database/connection";
import { DepositDTO } from "../dto/request/deposit.dto";
import { DepositTransaction } from "../dto/response/depositTransaction.dto";
import { UserDTO } from "../dto/response/user.dto";
import { JWT } from "../security/jwt";
import { v4 as uuidv4 } from "uuid";
import * as Joi from "joi";
import { TransferDTO } from "../dto/request/transfer.dto";
import { Knex } from "knex";
import { Wallet } from "../dto/response/wallet.dto";
import { TransferTransactionDTO } from "../dto/response/transferTransaction.dto";
import { WithdrawalTransactionDTO } from "../dto/response/withdrawalTransaction.dto";
import { WithrawalDTO } from "../dto/request/withdrawal.dto";

const wallets = Router();

wallets.post("/deposit", async (req: Request, res: Response) => {
  const authToken = req.headers.authorization.split(" ")[1];
  const user = JWT.getUser(authToken);
  const deposit: DepositDTO = req.body;

  try {
    await validate(deposit, "deposit");
  } catch (error) {
    return res.status(400).send({
      message: error.message,
    });
  }

  //storing money as integer: NGN 19.98 = 1998 Kobo
  const amount = deposit.amount * 100;

  const depositTransaction: DepositTransaction = {
    userId: user.id,
    amount: amount / 100,
    currencyCode: deposit.currencyCode,
    status: "success",
    transactionId: uuidv4(),
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  };

  if (!(await updateBalance("increment", amount, user))) {
    depositTransaction.status = "failed";
  }

  // save transaction data
  await knex("deposits")
    .insert({
      user_id: depositTransaction.userId,
      amount: amount,
      currency_code: depositTransaction.currencyCode,
      status: depositTransaction.status,
      transaction_id: depositTransaction.transactionId,
    })
    .then((id) => {
      return res.status(200).send(depositTransaction);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({
        message: "Unknown error",
      });
    });
});

wallets.post("/withdraw", async (req: Request, res: Response) => {
  const authToken = req.headers.authorization.split(" ")[1];
  const user = JWT.getUser(authToken);
  const withrawalRequest: WithrawalDTO = req.body;

  try {
    await validate(withrawalRequest, "withdrawal");
  } catch (error) {
    return res.status(400).send({
      message: error.message,
    });
  }

  //storing money as integer: NGN 19.98 = 1998 Kobo
  const amount = withrawalRequest.amount * 100;

  const wallet = await knex<Wallet>("wallets")
    .where("user_id", user.id)
    .then((wallets) => {
      return wallets[0];
    });

  if (wallet.balance < amount) {
    return res.status(400).send({
      message: "insufficient balance",
    });
  }

  const withdrawalTransaction: WithdrawalTransactionDTO = {
    userId: user.id,
    amount: amount / 100,
    accountNumber: withrawalRequest.accountNumber,
    accountName: withrawalRequest.accountName,
    bank: withrawalRequest.bank,
    currencyCode: withrawalRequest.currencyCode,
    status: "success",
    transactionId: uuidv4(),
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  };

  if (!(await updateBalance("decrement", amount, user))) {
    withdrawalTransaction.status = "failed";
    return res.status(500).send({
      message: "transaction failed",
    });
  }

  // save transaction data
  await knex("withdrawals")
    .insert({
      user_id: user.id,
      amount: amount,
      account_number: withdrawalTransaction.accountNumber,
      account_name: withdrawalTransaction.accountName,
      bank: withdrawalTransaction.bank,
      currency_code: withdrawalTransaction.currencyCode,
      status: withdrawalTransaction.status,
      transaction_id: withdrawalTransaction.transactionId,
      created_at: withdrawalTransaction.createdAt,
    })
    .then((id) => {
      return res.status(200).send(withdrawalTransaction);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({
        message: "Unknown error",
      });
    });
});

wallets.post("/transfer", async (req: Request, res: Response) => {
  const authToken = req.headers.authorization.split(" ")[1];
  const user = JWT.getUser(authToken);
  const transfer: TransferDTO = req.body;

  try {
    await validate(transfer, "transfer");
  } catch (error) {
    return res.status(400).send({
      message: error.message,
    });
  }

  const amount = transfer.amount * 100;

  //retrieve beneficiary
  const beneficiary: UserDTO = await knex<UserDTO>("users")
    .select()
    .where("email", transfer.beneficiary)
    .then((users) => users[0])
    .catch((err) => {
      console.log(err);
      return null;
    });

  if (!beneficiary) {
    return res.status(400).send({
      message: "beneficiary not found",
    });
  }

  //retrieve senders wallet
  const wallet = await knex<Wallet>("wallets")
    .where("user_id", user.id)
    .then((wallets) => {
      return wallets[0];
    });

  if (wallet.balance < amount) {
    return res.status(400).send({
      message: "insufficient balance",
    });
  }

  //update senders balance
  if (!(await updateBalance("decrement", amount, user))) {
    return res.status(500).send({
      message: "unable to complete transfer",
    });
  }

  //update receiver
  if (!(await updateBalance("increment", amount, beneficiary))) {
    //reverse failed transaction
    if (!(await updateBalance("increment", amount, beneficiary))) {
      return res.status(500).send({
        message: "error occured: reversal failed",
      });
    }
    return res.status(500).send({
      message: "unknown error occured",
    });
  }

  const transaction: TransferTransactionDTO = {
    senderId: user.id,
    beneficiaryId: beneficiary.id,
    beneficiaryEmail: beneficiary.email,
    amount: amount / 100,
    currencyCode: transfer.currencyCode,
    status: "success",
    transactionId: uuidv4(),
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  };

  // save transaction data
  await knex("transfers")
    .insert({
      sender_id: user.id,
      beneficiary_id: beneficiary.id,
      beneficiary_email: beneficiary.email,
      amount: amount,
      currency_code: transfer.currencyCode,
      status: transaction.status,
      transaction_id: transaction.transactionId,
      created_at: transaction.createdAt,
    })
    .then((id) => {
      return res.status(200).send(transaction);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({
        message: "Unknown error",
      });
    });
});

async function updateBalance(action: string, amount: number, user: UserDTO) {
  const builder: Knex.QueryBuilder = knex("wallets")
    .where("user_id", user.id)
    .update("updated_at", moment().format("YYYY-MM-DD HH:mm:ss"));
  if (action === "increment") {
    builder.increment("balance", amount);
  } else {
    builder.decrement("balance", amount);
  }
  const res = await builder
    .then((wallets) => {
      return true;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });

  return res.valueOf();
}

async function validate(body: object, form: string = "deposit") {
  let schema: Joi.ObjectSchema;
  if (form === "deposit") {
    schema = Joi.object({
      amount: Joi.number().required().positive(),
      currencyCode: Joi.string().required().max(4),
    });
  } else if (form === "transfer") {
    schema = Joi.object({
      amount: Joi.number().required().positive(),
      currencyCode: Joi.string().required().max(4),
      beneficiary: Joi.string().email().required(),
    });
  } else {
    schema = Joi.object({
      amount: Joi.number().required().positive(),
      currencyCode: Joi.string().required().max(4),
      accountName: Joi.string().required(),
      accountNumber: Joi.string().required().min(10).max(10),
      bank: Joi.string().required(),
    });
  }

  return await schema.validateAsync(body);
}

export default wallets;
