import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const client = postgres(process.env.DATABASE_URL!, {
  ssl: "require",
  prepare: false,
});
export const db = drizzle(client, { schema });

async function ensureDefaultAdmin() {
  const companyId = "550e8400-e29b-41d4-a716-446655440000";

  const companyExists = await db
    .select()
    .from(schema.companies)
    .where(eq(schema.companies.id, companyId))
    .limit(1);

  if (!companyExists[0]) {
    await db.insert(schema.companies).values({
      id: companyId,
      name: "Gloss Pet",
    });
  }

  const adminExists = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "admin"))
    .limit(1);

  if (!adminExists[0]) {
    const hashedPassword = await bcrypt.hash("admin", 10);
    await db.insert(schema.users).values({
      email: "admin",
      password: hashedPassword,
      name: "Administrador",
      role: "admin",
      companyId,
    });
  }
}

void ensureDefaultAdmin();
