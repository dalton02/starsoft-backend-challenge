import 'dotenv/config';
import { cleanEnv, str, num, bool, email, url } from 'envalid';

export const niceEnv = cleanEnv(process.env, {
  PORT: num(),
  REDIS_URL: str(),
  DATABASE_URL: str(),
  TEST_DATABASE_URL: str(),
});
