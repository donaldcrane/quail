import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("credits", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.uuid("owner");
    table.uuid("sender");
    table.integer("amount").defaultTo(0);
    table.string("reference").notNullable().defaultTo("empty");
    table.enu("type", ["cardPayment", "transfer"]);
    table.enu("status", ["pending", "success", "declined", "failed", "cancelled", "conflict"]).defaultTo("pending");
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign("owner").references("id").inTable("users");
    table.foreign("sender").references("id").inTable("users");
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable("credits");
}
