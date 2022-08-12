// Update with your config settings.

import config from "./src/config";

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const db = {

  development: {
    client: 'mysql',
    connection:  config.MYSQL_URL
  },

  staging: {
    client: 'mysql',
    connection:  config.MYSQL_URL
  },

  production: {
    client: 'mysql',
    connection:  config.MYSQL_URL
  }

};

export default db;