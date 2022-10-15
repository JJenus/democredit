import { Knex } from "knex";
import moment = require("moment");
import knex from "../database/connection";
import { Wallet } from "../dto/response/wallet.dto";

export const walletRepository = {
  async save(userId: number) {
    knex("wallets")
      .insert({
        user_id: userId,
        balance: 0,
        currency_code: "NGN",
      })
      .then()
      .catch((err) => {
        console.log(err);
      });
  },

  async findByUserId(userId: number) {
    const wallet: Wallet = await knex("wallets")
      .select()
      .where("user_id", userId)
      .then((wallets: any) => {
        if (!wallets[0]) {
          return null;
        }

        let wallet: Wallet = {
          userId: wallets[0].user_id,
          balance: wallets[0].balance / 100,
          currencyCode: wallets[0].currency_code,
          updatedAt: wallets[0].updated_at,
        };

        return wallet;
      })
      .catch((err) => {
        console.log(err.message);
        return null;
      });

    return wallet;
  },

  async updateBalance(
    userId: number,
    amount: number,
    action: string = "increment"
  ) {
    const query: Knex.QueryBuilder = knex("wallets")
      .where("user_id", userId)
      .update("updated_at", moment().format("YYYY-MM-DD HH:mm:ss"));
    if (action === "increment") {
      query.increment("balance", amount);
    } else {
      query.decrement("balance", amount);
    }

    const response: boolean = await query
      .then((wallets) => {
        return true;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });

    return response;
  },
};
