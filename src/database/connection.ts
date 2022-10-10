import Knex from "knex";
import Config from "./knexfile";

const env = process.env.NODE_ENV || "development";
const knex = Knex(Config[env]);

export default knex;
