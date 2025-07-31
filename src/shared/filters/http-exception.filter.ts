import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError, ValidationError } from '../types/error.types';

interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
  details?: Record<string, unknown>;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<AuthenticatedRequest>();

    let status: HttpStatus;
    let message: string;
    let code: string;
    let details: Record<string, unknown> | undefined;

    // Handle our custom AppError classes
    if (exception instanceof AppError) {
      status = exception.statusCode;
      message = exception.message;
      code = exception.code;
      
      // Add field information for validation errors
      if (exception instanceof ValidationError && exception.field) {
        details = { field: exception.field };
      }
    }
    // Handle NestJS HttpException
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = 'HTTP_EXCEPTION';
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as HttpExceptionResponse;
        message = Array.isArray(responseObj.message) 
          ? responseObj.message[0] 
          : (responseObj.message as string) || exception.message;
        code = responseObj.error || 'HTTP_EXCEPTION';
        details = responseObj.details;
      } else {
        message = exception.message;
        code = 'HTTP_EXCEPTION';
      }
    }
    // Handle validation errors from class-validator
    else if (exception instanceof Error && exception.message.includes('Validation failed')) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      code = 'VALIDATION_ERROR';
      details = { originalError: exception.message };
    }
    // Handle unknown errors
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      code = 'INTERNAL_ERROR';
      
      // Log the actual error for debugging
      this.logger.error('Unhandled exception:', exception);
      
      // Only include error details in development
      if (process.env.NODE_ENV === 'development') {
        details = {
          error: exception instanceof Error ? exception.message : String(exception),
          stack: exception instanceof Error ? exception.stack : undefined,
        };
      }
    }

    // Create error response
    const errorResponse = {
      statusCode: status,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(details && { details }),
    };

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} ${message}`,
      {
        code,
        userAgent: request.get('User-Agent'),
        ip: request.ip,
        userId: request.user?.id,
        details,
      }
    );

    // Send response
    response.status(status).json(errorResponse);
  }
} 