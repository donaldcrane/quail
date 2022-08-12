import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("firstName").notNullable();
    table.string("lastName").notNullable();
    table.string("email").unique().notNullable();
    table.string("password").notNullable();
    table.string("phone").unique().notNullable();
    table.string("photo").defaultTo("empty");
    table.integer("balance").defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable("users");
}
