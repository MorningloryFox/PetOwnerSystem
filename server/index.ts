import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import pg from "pg";
import connectPgSimple from "connect-pg-simple";
import { ensureDatabase } from "./db";
import { storage } from "./storage";
import bcrypt from "bcryptjs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure sessions
const PgStore = connectPgSimple(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'gloss-pet-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  store: new PgStore({
    conString: process.env.POSTGRES_URL
  }),
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function ensureAdminUser() {
  const adminEmail = 'admin';
  const adminPassword = 'admin';
  const companyId = '550e8400-e29b-41d4-a716-446655440000';

  const existingAdmin = await storage.getUserByEmail(adminEmail, companyId);
  if (existingAdmin) return;

  const company = await storage.getCompany(companyId);
  if (!company) {
    await storage.createCompany({
      id: companyId,
      name: 'Gloss Pet',
      email: 'admin@glosspet.com',
      phone: '(11) 9999-9999',
      address: 'São Paulo, SP',
      logo: 'https://via.placeholder.com/150',
      isActive: true,
      createdAt: new Date(),
    });
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await storage.createUser({
    email: adminEmail,
    password: hashedPassword,
    name: 'Administrador',
    role: 'admin',
    companyId,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

(async () => {
  await ensureDatabase();
  await ensureAdminUser();
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5001', 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
