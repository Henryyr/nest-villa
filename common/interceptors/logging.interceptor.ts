import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

interface LoggedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<LoggedRequest>();
    const res = context.switchToHttp().getResponse<Response>();
    const method = req.method;
    const url = req.url;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    const user = req.user;
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap({
          next: (data: unknown) => {
            const duration = Date.now() - now;
            const statusCode = res.statusCode;
            const userId = user?.id || 'anonymous';
            const userRole = user?.role || 'guest';
            
            this.logger.log(
              `[${method}] ${url} - ${statusCode} - ${duration}ms - User: ${userId} (${userRole}) - IP: ${ip} - UA: ${userAgent}`
            );
          },
          error: (error: Error) => {
            const duration = Date.now() - now;
            const statusCode = res.statusCode || 500;
            const userId = user?.id || 'anonymous';
            const userRole = user?.role || 'guest';
            
            this.logger.error(
              `[${method}] ${url} - ERROR ${statusCode} - ${duration}ms - User: ${userId} (${userRole}) - IP: ${ip} - Error: ${error.message}`
            );
          }
        }),
        catchError((error: Error) => {
          const duration = Date.now() - now;
          const userId = user?.id || 'anonymous';
          const userRole = user?.role || 'guest';
          
          this.logger.error(
            `[${method}] ${url} - UNHANDLED ERROR - ${duration}ms - User: ${userId} (${userRole}) - IP: ${ip} - Error: ${error.message}`
          );
          throw error;
        })
      );
  }
} 