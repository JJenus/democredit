import knex from "../database/connection";
import { DepositTransaction } from "../dto/response/depositTransaction.dto";
import { v4 as uuidv4 } from "uuid";
import moment = require("moment");

export const depositRepository = {
  async save(
    userId: number,
    amount: number,
    currencyCode: string,
    status = "failed"
  ) {
    const transactionId = uuidv4();
    const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");

    knex("deposits")
      .insert({
        user_id: userId,
        amount: amount,
        currency_code: currencyCode,
        status: status,
        transaction_id: transactionId,
        created_at: createdAt,
      })
      .then((id) => {})
      .catch((err) => {
        console.log(err);
      });

    const depositTransaction: DepositTransaction = {
      userId: userId,
      amount: amount / 100,
      currencyCode: currencyCode,
      status: status,
      transactionId: transactionId,
      createdAt: createdAt,
    };

    return depositTransaction;
  },

  async findByUserId(userId: number) {
    const deposits: DepositTransaction[] = await knex("deposits")
      .select()
      .where("user_id", userId)
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
        return [];
      });

    return deposits;
  },

  async findByTransactionId(transactionId: number) {
    const deposit: DepositTransaction = await knex("deposits")
      .select("*")
      .where("transaction_id", transactionId)
      .then((transactions: any) => {
        const data = transactions[0];
        if (!data) {
          return null;
        }
        const transaction: DepositTransaction = {
          userId: data.user_id,
          amount: data.amount / 100, //setting amount from e.g 950 kobo to NGN 9.50
          currencyCode: data.currency_code,
          status: data.status,
          transactionId: data.transaction_id,
          createdAt: data.created_at,
        };

        return transaction;
      })
      .catch((err) => {
        console.log(err);
        return null;
      });

    return deposit;
  },
};
