/* eslint-disable no-unused-expressions */
import knex from "knex";
import config from "./index";
import connection from "../../knexfile";

let environmentConfig;
config.NODE_ENV === "development" ? environmentConfig = connection.development : environmentConfig = connection.production;
const db = knex(environmentConfig);

export default db;
