import { Response, Request, Router } from "express";
import moment = require("moment");
import knex from "../database/connection";
import { DepositDTO } from "../dto/request/deposit.dto";
import { DepositTransaction } from "../dto/response/depositTransaction.dto";
import { UserDTO } from "../dto/response/user.dto";
import { JWT } from "../security/jwt";
import { v4 as uuidv4 } from "uuid";
import * as Joi from "joi";


const wallets = Router();

wallets.post("/deposit", async (req: Request, res: Response) => {
  const authToken = req.headers.authorization.split(" ")[1];
  const user = JWT.getUser(authToken);
  const deposit: DepositDTO = req.body;

  try {
    await validate(deposit, "deposit")
  } catch (error) {
    return res.status(400).send({
      message: error.message
    })
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

  if (!(await updateBalance(amount, user))) {
    depositTransaction.status = "failed";
  }

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

async function updateBalance(amount: number, user: UserDTO) {
  const res = await knex("wallets")
    .where("user_id", user.id)
    .update("updated_at", moment().format("YYYY-MM-DD HH:mm:ss"))
    .increment("balance", amount)
    .then((wallets) => {
      console.log(wallets);
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
  if (form == "deposit") {
    schema = Joi.object({
      amount: Joi.number().required().positive(),
      currencyCode: Joi.string().required().max(4),
    });
  }

  return await schema.validateAsync(body);
}

export default wallets;
