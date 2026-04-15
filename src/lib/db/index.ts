import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL?.replace(
        "sslmode=require",
        "sslmode=require&uselibpqcompat=true"
    ),
});

export const db = drizzle(pool, { schema });
