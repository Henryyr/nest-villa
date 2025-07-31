import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  error?: string;
  details?: Record<string, unknown>;
  validationErrors?: ValidationError[];
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'An error occurred';
    let validationErrors: ValidationError[] = [];

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      
      if (exception instanceof BadRequestException) {
        // Handle validation errors in GlobalExceptionFilter
        message = 'Validation failed';
        
        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
          const responseObj = exceptionResponse as any;
          
          if (responseObj.errors && Array.isArray(responseObj.errors)) {
            // Custom validation pipe format
            validationErrors = responseObj.errors.map((error: string) => {
              const match = error.match(/^([^.]+): (.+)$/);
              if (match) {
                return {
                  field: match[1],
                  message: match[2],
                };
              }
              return {
                field: 'unknown',
                message: error,
              };
            });
          } else if (responseObj.message && Array.isArray(responseObj.message)) {
            // Default validation pipe format
            validationErrors = responseObj.message.map((error: string) => {
              const match = error.match(/^([^.]+): (.+)$/);
              if (match) {
                return {
                  field: match[1],
                  message: match[2],
                };
              }
              return {
                field: 'unknown',
                message: error,
              };
            });
          } else if (responseObj.message) {
            // Single error message
            validationErrors = [{
              field: 'general',
              message: responseObj.message,
            }];
          }
        }
      } else {
        message = typeof exceptionResponse === 'string' 
          ? exceptionResponse 
          : (exceptionResponse as any)?.message || 'Bad Request';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    // Add validation errors if any
    if (validationErrors.length > 0) {
      errorResponse.validationErrors = validationErrors;
    }

    // Add error details for development
    if (process.env.NODE_ENV === 'development') {
      if (exception instanceof Error) {
        errorResponse.error = exception.name;
        errorResponse.details = {
          stack: exception.stack,
        };
      }
    }

    // Log the error
    this.logger.error(
      `Exception occurred: ${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      exception instanceof Error ? exception.stack : undefined
    );

    response.status(status).json(errorResponse);
  }
}