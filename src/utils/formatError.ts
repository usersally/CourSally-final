export function formatError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error as Error & { cause?: unknown }).cause
        ? { cause: formatError((error as Error & { cause?: unknown }).cause) }
        : {},
    };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  return { message: String(error) };
}
