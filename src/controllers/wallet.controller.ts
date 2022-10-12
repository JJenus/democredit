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

  if (!(await updateBalance("increement", amount, user))) {
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
  if (!(await updateBalance("decreement", amount, user))) {
    return res.status(500).send({
      message: "unable to complete transfer",
    });
  }

  //update receiver
  if (!(await updateBalance("increement", amount, beneficiary))) {
    //reverse failed transaction
    if (!(await updateBalance("increement", amount, beneficiary))) {
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
    amount: amount,
    currencyCode: transfer.currencyCode,
    status: "success",
    transactionId: uuidv4(),
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
  }

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
      created_at: transaction.createdAt
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
  if (action === "increement") {
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
  }
  else if(form === "transfer"){
    schema = Joi.object({
      amount: Joi.number().required().positive(),
      currencyCode: Joi.string().required().max(4),
      beneficiary: Joi.string().email().required()
    });
  }

  return await schema.validateAsync(body);
}

export default wallets;
