import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;
  private redisSubscriber: Redis;
  private redisPublisher: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    this.redisClient = new Redis(redisConfig);
    this.redisSubscriber = new Redis(redisConfig);
    this.redisPublisher = new Redis(redisConfig);

    this.redisClient.on('connect', () => {
      this.logger.log('Redis client connected');
    });

    this.redisClient.on('error', (error) => {
      this.logger.error('Redis client error:', error);
    });

    this.redisSubscriber.on('connect', () => {
      this.logger.log('Redis subscriber connected');
    });

    this.redisPublisher.on('connect', () => {
      this.logger.log('Redis publisher connected');
    });
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
    await this.redisSubscriber.quit();
    await this.redisPublisher.quit();
  }

  // Basic Redis operations
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.setex(key, ttl, value);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async del(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.redisClient.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.redisClient.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return await this.redisClient.ttl(key);
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number> {
    return await this.redisClient.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return await this.redisClient.hget(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.redisClient.hgetall(key);
  }

  async hdel(key: string, field: string): Promise<number> {
    return await this.redisClient.hdel(key, field);
  }

  // List operations
  async lpush(key: string, value: string): Promise<number> {
    return await this.redisClient.lpush(key, value);
  }

  async rpush(key: string, value: string): Promise<number> {
    return await this.redisClient.rpush(key, value);
  }

  async lpop(key: string): Promise<string | null> {
    return await this.redisClient.lpop(key);
  }

  async rpop(key: string): Promise<string | null> {
    return await this.redisClient.rpop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.redisClient.lrange(key, start, stop);
  }

  // Set operations
  async sadd(key: string, member: string): Promise<number> {
    return await this.redisClient.sadd(key, member);
  }

  async srem(key: string, member: string): Promise<number> {
    return await this.redisClient.srem(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    return await this.redisClient.smembers(key);
  }

  async sismember(key: string, member: string): Promise<number> {
    return await this.redisClient.sismember(key, member);
  }

  // Sorted Set operations
  async zadd(key: string, score: number, member: string): Promise<number> {
    return await this.redisClient.zadd(key, score, member);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.redisClient.zrange(key, start, stop);
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.redisClient.zrevrange(key, start, stop);
  }

  async zscore(key: string, member: string): Promise<number | null> {
    const result = await this.redisClient.zscore(key, member);
    return result ? parseFloat(result) : null;
  }

  async zrangebyscore(key: string, min: number | string, max: number | string): Promise<string[]> {
    return await this.redisClient.zrangebyscore(key, min, max);
  }

  async zremrangebyscore(key: string, min: number | string, max: number | string): Promise<number> {
    return await this.redisClient.zremrangebyscore(key, min, max);
  }

  // Increment operations
  async incr(key: string): Promise<number> {
    return await this.redisClient.incr(key);
  }

  async incrby(key: string, increment: number): Promise<number> {
    return await this.redisClient.incrby(key, increment);
  }

  // Get Redis clients for advanced operations
  getClient(): Redis {
    return this.redisClient;
  }

  getSubscriber(): Redis {
    return this.redisSubscriber;
  }

  getPublisher(): Redis {
    return this.redisPublisher;
  }
} 