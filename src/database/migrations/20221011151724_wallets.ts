import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable("wallets", function (table) {
    table.increments("id");
    table.string("user_id", 255).notNullable();
    table.integer("balance", 11).unique().notNullable();
    table.string("currency_code", 255).notNullable().defaultTo("NGN");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable("wallets");
}
