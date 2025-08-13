import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'path';
import * as schema from "@shared/schema";

// Use Supabase PostgreSQL connection
const connectionString = process.env.POSTGRES_URL || "postgresql://postgres.mdoalcyygfpblwudtoie:scRJGXtAkKgvFo9t@aws-1-sa-east-1.pooler.supabase.com:6543/postgres";

const client = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});
export const db = drizzle(client, { schema });

export async function ensureDatabase() {
  const migrationsFolder = path.join(process.cwd(), 'migrations');
  await migrate(db, { migrationsFolder });
}
