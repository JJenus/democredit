import knex from "../database/connection";
import { TransferTransactionDTO } from "../dto/response/transferTransaction.dto";
import { v4 as uuidv4 } from "uuid";
import moment = require("moment");

export const transferRepository = {
  async save(
    userId: number,
    amount: number,
    beneficiaryId: number,
    beneficiaryEmail: string,
    currencyCode: string,
    status: string = "failed"
  ) {
    const transactionId = uuidv4();
    const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");

    knex("transfers")
      .insert({
        sender_id: userId,
        beneficiary_id: beneficiaryId,
        beneficiary_email: beneficiaryEmail,
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

    const transaction: TransferTransactionDTO = {
      senderId: userId,
      beneficiaryId: beneficiaryId,
      beneficiaryEmail: beneficiaryEmail,
      amount: amount / 100,
      currencyCode: currencyCode,
      status: "success",
      transactionId: transactionId,
      createdAt: createdAt,
    };

    return transaction;
  },

  async findByUserId(userId: number) {
    const transfers: TransferTransactionDTO[] = await knex("transfers")
      .select("*")
      .where("sender_id", userId)
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
        return [];
      });

    return transfers;
  },

  async findByTransactionId(userId: number) {
    const transfer: TransferTransactionDTO = await knex("transfers")
      .select("*")
      .where("sender_id", userId)
      .then((transactions) => {
        const data = transactions[0];

        if (!data) {
          return null;
        }

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
      })
      .catch((err) => {
        console.log(err);
        return null;
      });

    return transfer;
  },
};
