import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { RedisService } from 'src/cache/redis/redis.service';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: 'ok' | 'error';
    redis: 'ok' | 'error';
    memory: 'ok' | 'error';
  };
  error?: string;
}

type ServiceStatus = 'ok' | 'error';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check(): Promise<HealthStatus> {
    const startTime = Date.now();
    const services: {
      database: ServiceStatus;
      redis: ServiceStatus;
      memory: ServiceStatus;
    } = {
      database: 'ok',
      redis: 'ok',
      memory: 'ok',
    };

    // Check database connectivity
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      services.database = 'error';
    }

    // Check Redis connectivity
    try {
      await this.redis.ping();
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      services.redis = 'error';
    }

    // Check memory usage
    try {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
      
      // Alert if memory usage is too high (over 1GB)
      if (heapUsedMB > 1024) {
        this.logger.warn(`High memory usage: ${heapUsedMB.toFixed(2)}MB`);
        services.memory = 'error';
      }
    } catch (error) {
      this.logger.error('Memory health check failed', error);
      services.memory = 'error';
    }

    const overallStatus = 
      services.database === 'ok' && 
      services.redis === 'ok' && 
      services.memory === 'ok' 
        ? 'ok' 
        : 'error';

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
      services,
    };

    if (overallStatus === 'error') {
      healthStatus.error = 'One or more services are unhealthy';
    }

    this.logger.log(`Health check completed in ${Date.now() - startTime}ms - Status: ${overallStatus}`);
    
    return healthStatus;
  }
} 