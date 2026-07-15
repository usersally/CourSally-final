import "dotenv/config";
import { logger } from "./utils/logger.js";
import { formatError } from "./utils/formatError.js";
import { connectDB } from "./services/db.js";
import app from "./app.js";

// Railway provides PORT environment variable
const PORT = Number(process.env.PORT) || 5000;

function validateEnv(): void {
  const missing: string[] = [];

  if (
    !process.env.MONGODB_URI?.trim() &&
    !process.env.MONGO_URL?.trim() &&
    !process.env.MONGODB_URL?.trim()
  ) {
    missing.push("MONGODB_URI");
  }

  if (!process.env.AUTH_SECRET?.trim()) {
    missing.push("AUTH_SECRET");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

async function startServer(): Promise<void> {
  try {
    validateEnv();
    await connectDB();

    // Listen on all interfaces for Railway
    const server = app.listen(PORT, "0.0.0.0", () => {
      logger.info(`✅ Server is running on port ${PORT}`);
      logger.info(
        `✅ CORS enabled for: ${process.env.FRONTEND_DOMAIN || "http://localhost:3000"}`,
      );
      logger.info(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`✅ Health check: http://localhost:${PORT}/health`);
    });

    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        logger.error(`❌ Port ${PORT} is already in use.`);
        process.exit(1);
      } else {
        logger.error("❌ Server error:", { error });
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error("❌ Failed to start Server", { error });
    console.error("❌ Failed to start Server:", formatError(error));
    process.exit(1);
  }
}

process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received. Closing server...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received. Closing server...");
  process.exit(0);
});

startServer();
