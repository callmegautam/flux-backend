import { drizzle } from "drizzle-orm/node-postgres";
import env from "@/config/env";
import { Pool } from "pg";

const pool = new Pool({ connectionString: env.DB_URL });
const db = drizzle(pool);

// const db = drizzle(env.DB_URL);

export default db;
