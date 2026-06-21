export class AppError extends Error {
  public statusCode: number;
  public errorCode?: string;

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Invalid input data", errorCode?: string) {
    super(message, 400, errorCode || "VALIDATION_ERROR");
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Unauthorized", errorCode?: string) {
    super(message, 401, errorCode || "AUTH_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Forbidden", errorCode?: string) {
    super(message, 403, errorCode || "FORBIDDEN_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", errorCode?: string) {
    super(message, 404, errorCode || "NOT_FOUND_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", errorCode?: string) {
    super(message, 409, errorCode || "CONFLICT_ERROR");
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests", errorCode?: string) {
    super(message, 429, errorCode || "RATE_LIMIT_ERROR");
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error", errorCode?: string) {
    super(message, 500, errorCode || "INTERNAL_ERROR");
  }
}
