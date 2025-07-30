import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { RedisModule } from 'src/cache/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {} 