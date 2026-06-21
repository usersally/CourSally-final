import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

if (process.env.NODE_ENV === "development") {
  mongoose.set("debug", true);
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (uri.includes("localhost:3000") || uri.includes("127.0.0.1:3000")) {
    throw new Error(
      "MONGODB_URI points to port 3000 (frontend port). Use 27017 for local MongoDB or your Atlas/Railway connection string.",
    );
  }

  const username = process.env.MONGODB_USERNAME?.trim();
  const password = process.env.MONGODB_PASSWORD?.trim();
  const options: mongoose.ConnectOptions = {
    dbName: process.env.MONGODB_DB_NAME,
  };

  if (username && password) {
    options.auth = { username, password };
  }

  try {
    const connection = await mongoose.connect(uri, options);

    logger.info("MongoDB connected");
    console.log("MongoDB connected");

    return connection;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logger.error("MongoDB connection error", { error: errorMessage });
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
