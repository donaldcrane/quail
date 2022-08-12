import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("accounts", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("owner");
    table.string("bankName").defaultTo("empty");
    table.string("accountNo");
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign("owner").references("id").inTable("users");
  });
}


export async function down(knex: Knex): Promise<void> {
    return await knex.schema.dropTable("accounts");
}

