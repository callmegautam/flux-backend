import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import env from '@/config/env';

const db = drizzle(env.DB_URL);

export default db;
