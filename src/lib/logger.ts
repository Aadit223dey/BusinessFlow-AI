/**
 * Structured Application Logger
 *
 * Provides formatted, color-coded development logs and structured
 * JSON production logs. Sanitizes sensitive data (passwords, tokens, keys)
 * and tracks operation correlation IDs and elapsed times.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  operation: string;
  userId?: string;
  tenantId?: string;
  elapsedMs?: number;
  correlationId?: string;
  [key: string]: unknown;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "anonkey",
  "servicekey",
  "apikey",
  "access_token",
  "refresh_token",
  "supabase_anon_key",
]);

function sanitize(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      clean[key] = sanitize(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

class Logger {
  private generateCorrelationId(): string {
    return `req_${Math.random().toString(36).substring(2, 9)}`;
  }

  private log(level: LogLevel, message: string, context: LogContext) {
    const timestamp = new Date().toISOString();
    const correlationId = context.correlationId || this.generateCorrelationId();
    const sanitizedContext = sanitize(context) as LogContext;

    const payload = {
      timestamp,
      level,
      correlationId,
      message,
      ...sanitizedContext,
    };

    if (process.env.NODE_ENV === "development") {
      const color =
        level === "error"
          ? "\x1b[31m"
          : level === "warn"
            ? "\x1b[33m"
            : level === "debug"
              ? "\x1b[90m"
              : "\x1b[36m";
      const reset = "\x1b[0m";
      const consoleFn = level === "debug" ? "log" : level;
      console[consoleFn](
        `${color}[${timestamp}] [${level.toUpperCase()}] [${context.operation}]${reset} ${message}`,
        sanitizedContext
      );
    } else {
      const consoleFn = level === "debug" ? "log" : level;
      console[consoleFn](JSON.stringify(payload));
    }
  }

  info(message: string, context: LogContext) {
    this.log("info", message, context);
  }

  warn(message: string, context: LogContext) {
    this.log("warn", message, context);
  }

  error(message: string, context: LogContext) {
    this.log("error", message, context);
  }

  debug(message: string, context: LogContext) {
    this.log("debug", message, context);
  }

  /**
   * Creates a timer for measuring operation duration.
   * Returns a function that, when called, logs the elapsed time.
   */
  startTimer(operation: string, context?: Partial<LogContext>): () => void {
    const start = Date.now();
    const correlationId = this.generateCorrelationId();
    this.info(`Starting ${operation}`, { operation, correlationId, ...context });
    return () => {
      const elapsedMs = Date.now() - start;
      this.info(`Completed ${operation}`, { operation, correlationId, elapsedMs, ...context });
    };
  }
}

export const logger = new Logger();
