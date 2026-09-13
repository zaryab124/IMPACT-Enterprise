export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  module?: string;
  timestamp: string;
  data?: unknown;
  error?: unknown;
}

class Logger {
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.currentLevel];
  }

  private format(payload: LogPayload): string {
    if (process.env.NODE_ENV === "production") {
      return JSON.stringify(payload);
    }
    const colorMap: Record<LogLevel, string> = {
      debug: "\x1b[34m", // Blue
      info: "\x1b[32m",  // Green
      warn: "\x1b[33m",  // Yellow
      error: "\x1b[31m", // Red
    };
    const reset = "\x1b[0m";
    const mod = payload.module ? `[${payload.module}] ` : "";
    const color = colorMap[payload.level] || "";
    return `${payload.timestamp} ${color}${payload.level.toUpperCase()}${reset} ${mod}${payload.message}`;
  }

  private write(level: LogLevel, message: string, module?: string, data?: unknown, error?: unknown) {
    if (!this.shouldLog(level)) return;

    const payload: LogPayload = {
      level,
      message,
      module,
      timestamp: new Date().toISOString(),
      ...(data !== undefined && { data }),
      ...(error !== undefined && {
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      }),
    };

    const formatted = this.format(payload);
    if (level === "error") {
      console.error(formatted, payload.error || "");
    } else if (level === "warn") {
      console.warn(formatted, payload.data || "");
    } else {
      console.log(formatted, payload.data || "");
    }
  }

  public debug(message: string, meta?: { module?: string; data?: unknown }) {
    this.write("debug", message, meta?.module, meta?.data);
  }

  public info(message: string, meta?: { module?: string; data?: unknown }) {
    this.write("info", message, meta?.module, meta?.data);
  }

  public warn(message: string, meta?: { module?: string; data?: unknown }) {
    this.write("warn", message, meta?.module, meta?.data);
  }

  public error(message: string, error?: unknown, meta?: { module?: string; data?: unknown }) {
    this.write("error", message, meta?.module, meta?.data, error);
  }
}

export const logger = new Logger();
