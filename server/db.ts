import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'path';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use Supabase PostgreSQL connection
const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("POSTGRES_URL is not set");
}

const client = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});
export const db = drizzle(client, { schema });

export async function ensureDatabase() {
  const migrationsFolder = path.join(process.cwd(), 'migrations');
  await migrate(db, { migrationsFolder });
}
