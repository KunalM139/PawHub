type LogLevel = "info" | "warn" | "error" | "security";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error | unknown;
}

const SENSITIVE_KEYS = [
  "password", "token", "otp", "secret", "apikey", "api_key",
  "creditcard", "cvv", "payment", "accessToken", "refreshToken"
];

function sanitizeContext(context: Record<string, any>): Record<string, any> {
  const sanitized = { ...context };
  for (const key in sanitized) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
        sanitized[key] = sanitizeContext(sanitized[key]);
      }
    }
  }
  return sanitized;
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
  security: (message: string, context?: Record<string, any>) => {
    log({ level: "security", message, context });
  },
};

function log(payload: LogPayload) {
  const timestamp = new Date().toISOString();
  const env = process.env.NODE_ENV || "development";
  const context = payload.context ? sanitizeContext(payload.context) : undefined;
  
  const formattedLog = {
    timestamp,
    level: payload.level.toUpperCase(),
    message: payload.message,
    ...(context ? { context } : {}),
    ...(payload.error ? { 
      error: payload.error instanceof Error 
        ? { 
            message: payload.error.message, 
            name: payload.error.name,
            stack: env === "development" ? payload.error.stack : undefined 
          }
        : payload.error 
    } : {}),
  };

  if (env === "production") {
    // In production, output structured JSON for aggregators
    // Use console.error for actual errors and security breaches, console.log for info/warn
    if (payload.level === "error" || payload.level === "security") {
      console.error(JSON.stringify(formattedLog));
    } else {
      console.log(JSON.stringify(formattedLog));
    }
  } else {
    // In development, output readable logs
    const prefix = `[${timestamp}] [${payload.level.toUpperCase()}]`;
    if (payload.level === "error" || payload.level === "security") {
      console.error(prefix, payload.message, payload.error || "", context || "");
    } else if (payload.level === "warn") {
      console.warn(prefix, payload.message, context || "");
    } else {
      console.log(prefix, payload.message, context || "");
    }
  }
}
