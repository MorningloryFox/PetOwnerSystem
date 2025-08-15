import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";

import { ensureDatabase } from "./db";
import { storage } from "./storage";
import { registerRoutes } from "./routes";
import { log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure sessions using Postgres store
const PgStore = connectPgSimple(session);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "gloss-pet-secret-key-2025",
    resave: false,
    saveUninitialized: false,
    store: new PgStore({
      conString: process.env.POSTGRES_URL,
    }),
    cookie: {
      secure: false, // set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);

// simple logging middleware for API routes
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: Record<string, unknown> | undefined;

  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    capturedJson = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJson) {
        line += ` :: ${JSON.stringify(capturedJson)}`;
      }
      if (line.length > 80) line = line.slice(0, 79) + "…";
      log(line);
    }
  });

  next();
});

async function ensureAdminUser() {
  const adminEmail = "admin";
  const adminPassword = "admin";
  const companyId = "550e8400-e29b-41d4-a716-446655440000";

  const existingAdmin = await storage.getUserByEmail(adminEmail, companyId);
  if (existingAdmin) return;

  const company = await storage.getCompany(companyId);
  if (!company) {
    await storage.createCompany({
      id: companyId,
      name: "Gloss Pet",
      email: "admin@glosspet.com",
      phone: "(11) 9999-9999",
      address: "São Paulo, SP",
      logo: "https://via.placeholder.com/150",
      isActive: true,
      createdAt: new Date(),
    });
  }

  const hashed = await bcrypt.hash(adminPassword, 10);
  await storage.createUser({
    email: adminEmail,
    password: hashed,
    name: "Administrador",
    role: "admin",
    companyId,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// Initialize database and routes at module load (runs once per cold start)
await ensureDatabase();
await ensureAdminUser();
registerRoutes(app);

// generic error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  throw err;
});

export { app };
