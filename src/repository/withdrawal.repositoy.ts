import moment = require("moment");
import knex from "../database/connection";
import { WithdrawalTransactionDTO } from "../dto/response/withdrawalTransaction.dto";
import { v4 as uuidv4 } from "uuid";

/**
 * TODO: implement save withdrawal
 */
export const withdrawalRepository = {
  async save(
    userId: number,
    amount: number,
    bank: string,
    accountName: string,
    accountNumber: number,
    currencyCode: string,
    status: string
  ) {
    const transactionId = uuidv4();
    const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");

    knex("withdrawals")
      .insert({
        user_id: userId,
        amount: amount,
        account_number: accountNumber,
        account_name: accountName,
        bank: bank,
        currency_code: currencyCode,
        status: status,
        transaction_id: transactionId,
        created_at: createdAt,
      })
      .then((id) => {})
      .catch((err) => {
        console.log(err);
      });

    const withdrawalTransaction: WithdrawalTransactionDTO = {
      userId: userId,
      amount: amount / 100,
      accountNumber: accountNumber,
      accountName: accountName,
      bank: bank,
      currencyCode: currencyCode,
      status: "success",
      transactionId: transactionId,
      createdAt: createdAt,
    };

    return withdrawalTransaction;
  },

  async findByUserId(userId: number) {
    const withdrawals: WithdrawalTransactionDTO[] = await knex("withdrawals")
      .select()
      .where("user_id", userId)
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

    return withdrawals;
  },

  async findByTransactionId(transactionId: number) {
    const withdrawal: WithdrawalTransactionDTO[] = await knex("withdrawals")
      .select()
      .where("transaction_id", transactionId)
      .then((transactions: any[]) => {
        const data = transactions[0];
        if (!data) {
          return null;
        }

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
      })
      .catch((err) => {
        console.log(err);
        return null;
      });

    return withdrawal;
  },
};
