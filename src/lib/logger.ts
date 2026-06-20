type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error | unknown;
}

export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    log({ level: "info", message, context });
  },
  warn: (message: string, context?: Record<string, any>) => {
    log({ level: "warn", message, context });
  },
  error: (message: string, error?: Error | unknown, context?: Record<string, any>) => {
    log({ level: "error", message, error, context });
  },
};

function log(payload: LogPayload) {
  const timestamp = new Date().toISOString();
  
  const formattedLog = {
    timestamp,
    level: payload.level.toUpperCase(),
    message: payload.message,
    ...(payload.context ? { context: payload.context } : {}),
    ...(payload.error ? { 
      error: payload.error instanceof Error 
        ? { message: payload.error.message, stack: payload.error.stack }
        : payload.error 
    } : {}),
  };

  if (process.env.NODE_ENV === "production") {
    // In production, we output structured JSON for log aggregators (e.g., Datadog, ELK)
    console[payload.level](JSON.stringify(formattedLog));
  } else {
    // In development, we output readable logs
    const prefix = `[${timestamp}] [${payload.level.toUpperCase()}]`;
    if (payload.level === "error") {
      console.error(prefix, payload.message, payload.error, payload.context || "");
    } else if (payload.level === "warn") {
      console.warn(prefix, payload.message, payload.context || "");
    } else {
      console.log(prefix, payload.message, payload.context || "");
    }
  }
}
