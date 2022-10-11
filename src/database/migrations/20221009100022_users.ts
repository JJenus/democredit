import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable("users", function (table) {
    table.increments("id");
    table.string("name", 255).notNullable();
    table.string("email", 255).unique().notNullable();
    table.string("password", 255).notNullable();
    table.timestamp("created_at").notNullable();
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable("users");
}
