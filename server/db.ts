import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@shared/schema";
const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "SUPABASE_DB_URL must be set. Did you forget to provision a database?",
  );
}

export const client = postgres(connectionString);
export const db = drizzle(client, { schema });
