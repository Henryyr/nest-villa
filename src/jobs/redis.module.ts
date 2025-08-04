import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { CacheService } from './cache.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { RateLimitService } from './rate-limit.service';
import { PubSubService } from './pubsub.service';
import { QueueService } from './queue.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: 'redis',
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB', 0),
        ttl: configService.get('REDIS_TTL', 3600),
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
    TokenService,
    RateLimitService,
    PubSubService,
    QueueService,
  ],
  exports: [
    RedisService,
    CacheService,
    SessionService,
    TokenService,
    RateLimitService,
    PubSubService,
    QueueService,
  ],
})
export class QueueModule {} 