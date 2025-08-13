import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

// Use Supabase PostgreSQL connection
const connectionString = process.env.DATABASE_URL || "postgresql://postgres.mdoalcyygfpblwudtoie:scRJGXtAkKgvFo9t@aws-1-sa-east-1.pooler.supabase.com:6543/postgres";

const client = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});
export const db = drizzle(client, { schema });
