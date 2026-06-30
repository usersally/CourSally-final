import { formatError } from "./formatError.js";

const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
} as const;

type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

/**
 * Internal log function
 * Formats and outputs log entries
 */
function serializeMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(meta)) {
    if (value instanceof Error || key === "error") {
      serialized[key] = formatError(value);
      continue;
    }

    serialized[key] = value;
  }

  return serialized;
}

function log(
  level: LogLevel,
  message: string,
  meta: Record<string, unknown> = {},
): void {
  const timestamp = new Date().toISOString();
  const logEntry: LogEntry = {
    timestamp,
    level,
    message,
    ...serializeMeta(meta),
  };

  if (process.env.NODE_ENV === "development") {
    console.log(JSON.stringify(logEntry, null, 2));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Logger object with methods for each log level
 */
export const logger = {
  error: (message: string, meta?: Record<string, unknown>) =>
    log(LOG_LEVELS.ERROR, message, meta),
  warn: (message: string, meta?: Record<string, unknown>) =>
    log(LOG_LEVELS.WARN, message, meta),
  info: (message: string, meta?: Record<string, unknown>) =>
    log(LOG_LEVELS.INFO, message, meta),
  debug: (message: string, meta?: Record<string, unknown>) =>
    log(LOG_LEVELS.DEBUG, message, meta),
};
