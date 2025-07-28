// Custom Error Classes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(
      message,
      400,
      'VALIDATION_ERROR',
      true
    );
    this.field = field;
  }

  public readonly field?: string;
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR', true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR', true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR', true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR', true);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR', true);
  }
}

// Error Response Types
export interface ErrorResponse {
  statusCode: number;
  message: string;
  code: string;
  timestamp: string;
  path: string;
  method: string;
  details?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export interface ValidationErrorResponse extends ErrorResponse {
  code: 'VALIDATION_ERROR';
  details: Array<{
    field: string;
    value: unknown;
    constraint: string;
  }>;
}

// Error Codes
export const ERROR_CODES = {
  // Authentication & Authorization
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_PHONE: 'INVALID_PHONE',
  
  // Resource Errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PROPERTY_NOT_FOUND: 'PROPERTY_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  
  // System Errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  REDIS_ERROR: 'REDIS_ERROR',
  QUEUE_ERROR: 'QUEUE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // File Upload
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]; 