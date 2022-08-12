import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("users").del();

    // Inserts seed entries
    await knex("users").insert([
        {  name: "rowValue1", email: "abc@gmail.com", phone: "08100058452" },
        { name: "rowValue2", email: "abcs@gmail.com", phone: "08100458452" },
        { name: "rowValue3", email: "abcd@gmail.com", phone: "08100058352" }
    ]);
};
