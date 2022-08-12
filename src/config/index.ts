import { isEmpty } from "lodash";
import logger from "pino";
import dotenv from "dotenv";

dotenv.config();

const config = {
  logger: logger(),
  PORT: process.env.PORT,
  JWT_KEY: process.env.JWT_KEY,
  APP_NAME: process.env.APP_NAME,
  CLOUD_NAME: process.env.CLOUD_NAME,
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET,
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  NODE_ENV: process.env.NODE_ENV,
  MYSQL_URL: process.env.MYSQL_URL,
};

const absentConfig = Object.entries(config)
  .map(([key, value]) => [key, !!value])
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (!isEmpty(absentConfig)) {
  throw new Error(`Missing Config: ${absentConfig.join(", ")}`);
}

export default config;
