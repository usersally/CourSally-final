import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

if (process.env.NODE_ENV === "development") {
  mongoose.set("debug", true);
}

function resolveMongoUri(): string {
  const uri =
    process.env.MONGODB_URI?.trim() ||
    process.env.MONGO_URL?.trim() ||
    process.env.MONGODB_URL?.trim();

  if (!uri) {
    throw new Error(
      "MongoDB connection string is not set. Add MONGODB_URI (or MONGO_URL / MONGODB_URL) in Railway variables.",
    );
  }

  if (uri.includes("localhost:3000") || uri.includes("127.0.0.1:3000")) {
    throw new Error(
      "MONGODB_URI points to port 3000 (frontend port). Use 27017 for local MongoDB or your Atlas/Railway connection string.",
    );
  }

  const username = process.env.MONGODB_USERNAME?.trim();
  const password = process.env.MONGODB_PASSWORD?.trim();

  if (!username || !password || uri.includes("@")) {
    return uri;
  }

  if (uri.startsWith("mongodb+srv://")) {
    return uri.replace(
      "mongodb+srv://",
      `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@`,
    );
  }

  if (uri.startsWith("mongodb://")) {
    return uri.replace(
      "mongodb://",
      `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@`,
    );
  }

  return uri;
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = resolveMongoUri();
  const dbName = process.env.MONGODB_DB_NAME?.trim();

  const options: mongoose.ConnectOptions = {};
  if (dbName) {
    options.dbName = dbName;
  }

  try {
    const connection = await mongoose.connect(uri, options);

    logger.info("MongoDB connected", { dbName: dbName || "(from URI)" });

    return connection;
  } catch (err) {
    logger.error("MongoDB connection error", { error: err });
    throw err;
  }
}
