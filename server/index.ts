import { createServer } from "http";
import { app } from "./app";
import { setupVite, serveStatic, log } from "./vite";

const server = createServer(app);

(async () => {
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5001", 10);
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`serving on port ${port}`);
  });
})();
