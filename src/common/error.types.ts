export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}

export class PropertyNotFoundException extends Error {
    constructor(message: string = 'Property not found') {
      super(message);
      this.name = 'PropertyNotFoundException';
    }
  }
  
  export class UserNotFoundException extends Error {
    constructor(message: string = 'User not found') {
      super(message);
      this.name = 'UserNotFoundException';
    }
  }
  
  export class UserAlreadyExistsException extends Error {
    constructor(message: string = 'User already exists') {
      super(message);
      this.name = 'UserAlreadyExistsException';
    }
  }
  
  export class InvalidCredentialsException extends Error {
    constructor(message: string = 'Invalid credentials') {
      super(message);
      this.name = 'InvalidCredentialsException';
    }
  }
  
  export class RateLimitExceededException extends Error {
    constructor(message: string = 'Rate limit exceeded') {
      super(message);
      this.name = 'RateLimitExceededException';
    }
  }
  
  export class InvalidTokenException extends Error {
    constructor(message: string = 'Invalid token') {
      super(message);
      this.name = 'InvalidTokenException';
    }
  }
  
  export class DatabaseOperationException extends Error {
    constructor(message: string = 'Database operation failed') {
      super(message);
      this.name = 'DatabaseOperationException';
    }
  }
