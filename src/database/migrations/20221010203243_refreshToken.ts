import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable("refresh_tokens", function (table) {
    table.string("id", 255).notNullable().primary();
    table.integer("user_id").notNullable();
    table.string("jwt_id", 255).unique().notNullable();
    table.boolean("used").defaultTo(false);
    table.boolean("invalidated").defaultTo(false);
    table.timestamp("expires_in").notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable("refresh_tokens");
}
