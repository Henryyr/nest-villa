import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from './health.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 123.456 },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' },
        services: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'ok' },
            redis: { type: 'string', example: 'ok' },
            memory: { type: 'string', example: 'ok' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Application is unhealthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        error: { type: 'string', example: 'Service unavailable' }
      }
    }
  })
  async check(@Res() res: Response) {
    try {
      const healthStatus = await this.healthService.check();
      
      if (healthStatus.status === 'ok') {
        return res.status(HttpStatus.OK).json(healthStatus);
      } else {
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(healthStatus);
      }
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error.message
      });
    }
  }
} 