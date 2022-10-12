import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return await knex.schema.createTable("transfers", function (table) {
      table.increments("id");
      table.integer("sender_id").notNullable();
      table.integer("beneficiary_id").notNullable();
      table.string("beneficiary_email", 255).notNullable();
      table.integer("amount", 11).notNullable();
      table.string("currency_code", 5).notNullable().defaultTo("NGN");
      table.string("status").notNullable();
      table.string("transaction_id").notNullable().unique();
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    });
  }
  
  export async function down(knex: Knex): Promise<void> {
    return await knex.schema.dropTable("transfers");
  }

