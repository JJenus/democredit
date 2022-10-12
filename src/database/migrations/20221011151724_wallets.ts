import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable("wallets", function (table) {
    table.increments("id");
    table.integer("user_id", 255).unique().notNullable().unsigned();
    table.integer("balance", 11).notNullable();
    table.string("currency_code", 255).notNullable().defaultTo("NGN");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.foreign("user_id").references("id").inTable("users");
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable("wallets");
}
