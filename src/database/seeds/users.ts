import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("users").del();

  // Inserts seed entries
  await knex("users").insert([
    { id: 1, name: "Gold Dew", email: "golden@la.vida", password: "jjenus" },
    {
      id: 2,
      name: "Prettier Life",
      email: "plif@girih.lv",
      password: "jjenus",
    },
    {
      id: 3,
      name: "Henry kumeti",
      email: "kumevibes@eles.olema",
      password: "jjenus",
    },
  ]);
}
