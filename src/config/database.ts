import config from "./index";
import connection from '../../knexfile';
import knex from 'knex';


let environmentConfig;
config.NODE_ENV === 'development' ? environmentConfig = connection.development : environmentConfig = connection.production;
const db = knex(environmentConfig);

export default db;
