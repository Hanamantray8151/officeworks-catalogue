import app from "./app";
import { env } from "./config/env";

// Start the HTTP server on the configured port.
const server = app.listen(env.API_PORT, () => {
  console.log(`API server running at http://localhost:${env.API_PORT}`);

  console.log(`Health check: http://localhost:${env.API_PORT}/api/health`);
});

// Handle server startup and listening errors.
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${env.API_PORT} is already in use.`);
  } else {
    console.error("Failed to start API server:", error);
  }

  process.exit(1);
});

// Handle graceful shutdown.
function shutdown(signal: string): void {
  console.log(`${signal} received. Shutting down API server...`);

  server.close((error) => {
    if (error) {
      console.error("Error during server shutdown:", error);
      process.exitCode = 1;
    } else {
      console.log("API server stopped successfully.");
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
