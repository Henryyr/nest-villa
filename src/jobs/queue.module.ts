import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { RedisService } from './redis.service';
import { CacheService } from './cache.service';
import { SessionService } from './session.service'; 
import { PubSubService } from './pubsub.service';
import { TokenService } from './token.service';
import { RateLimitService } from './rate-limit.service';
import { QueueService } from './queue.service';
import { NotificationProcessor } from './processors/notification.processor';
import { PropertyProcessor } from './processors/property.processor';
import { UserProcessor } from './processors/user.processor';

@Module({
      imports: [
      ConfigModule,
      CacheModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          store: 'redis',
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_CACHE_DB', 0),
          ttl: 60 * 60 * 24, // 24 hours default TTL
          max: 100, // maximum number of items in cache
        }),
        inject: [ConfigService],
      }),
          ThrottlerModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          throttlers: [
            {
              ttl: configService.get('THROTTLE_TTL', 60) * 1000,
              limit: configService.get('THROTTLE_LIMIT', 10),
            },
          ],
        }),
        inject: [ConfigService],
      }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_QUEUE_DB', 1),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'notification' },
      { name: 'property' },
      { name: 'user' },
      { name: 'search' },
      { name: 'file' },
      { name: 'message' },
    ),
  ],
  providers: [
    RedisService,
    CacheService,
    SessionService,
    PubSubService,
    TokenService,
    RateLimitService,
    QueueService,
    NotificationProcessor,
    PropertyProcessor,
    UserProcessor,
  ],
  exports: [
    RedisService,
    CacheService,
    SessionService,
    PubSubService,
    TokenService,
    RateLimitService,
    QueueService,
  ],
})
export class QueueModule {} 