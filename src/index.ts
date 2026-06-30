import "dotenv/config";
import { logger } from "./utils/logger.js";
import { formatError } from "./utils/formatError.js";
import { connectDB } from "./services/db.js";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 5000;

function validateEnv(): void {
  const missing: string[] = [];

  if (!process.env.MONGODB_URI?.trim() && !process.env.MONGO_URL?.trim() && !process.env.MONGODB_URL?.trim()) {
    missing.push("MONGODB_URI");
  }

  if (!process.env.AUTH_SECRET?.trim()) {
    missing.push("AUTH_SECRET");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

async function startServer(): Promise<void> {
  validateEnv();
  await connectDB();

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  logger.error("Failed to start Server", { error });
  console.error("Failed to start Server:", formatError(error));
  process.exit(1);
});
