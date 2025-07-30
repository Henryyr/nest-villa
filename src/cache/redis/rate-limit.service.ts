import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { Logger } from '@nestjs/common';
import { RateLimitConfig, RateLimitResult } from '../../shared/interfaces/redis.interface';

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly RATE_LIMIT_PREFIX = 'rate_limit:';

  constructor(private readonly redisService: RedisService) {}

  // Check rate limit for a key
  async checkRateLimit(
    key: string,
    config: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const rateLimitKey = `${this.RATE_LIMIT_PREFIX}${key}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get current requests in the window
    const requests = await this.redisService.zrangebyscore(
      rateLimitKey,
      windowStart,
      '+inf',
    );

    const currentCount = requests.length;

    if (currentCount >= config.maxRequests) {
      // Rate limit exceeded
      const oldestRequest = await this.redisService.zrange(rateLimitKey, 0, 0);
      const resetTime = oldestRequest.length > 0 
        ? parseInt(oldestRequest[0]) + config.windowMs 
        : now + config.windowMs;

      return {
        limit: config.maxRequests,
        remaining: 0,
        reset: resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000),
      };
    }

    // Add current request
    await this.redisService.zadd(rateLimitKey, now, now.toString());
    await this.redisService.expire(rateLimitKey, Math.ceil(config.windowMs / 1000));

    // Clean up old requests
    await this.redisService.zremrangebyscore(rateLimitKey, '-inf', windowStart - 1);

    return {
      limit: config.maxRequests,
      remaining: config.maxRequests - currentCount - 1,
      reset: now + config.windowMs,
    };
  }

  // API rate limiting
  async checkApiRateLimit(
    userId: string,
    endpoint: string,
    config: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const key = `api:${userId}:${endpoint}`;
    return await this.checkRateLimit(key, config);
  }

  // Login rate limiting
  async checkLoginRateLimit(
    identifier: string, // email or IP
    config: RateLimitConfig = { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  ): Promise<RateLimitResult> {
    const key = `login:${identifier}`;
    return await this.checkRateLimit(key, config);
  }

  // Registration rate limiting
  async checkRegistrationRateLimit(
    identifier: string, // email or IP
    config: RateLimitConfig = { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
  ): Promise<RateLimitResult> {
    const key = `registration:${identifier}`;
    return await this.checkRateLimit(key, config);
  }

  // Password reset rate limiting
  async checkPasswordResetRateLimit(
    email: string,
    config: RateLimitConfig = { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
  ): Promise<RateLimitResult> {
    const key = `password_reset:${email}`;
    return await this.checkRateLimit(key, config);
  }

  // Email sending rate limiting
  async checkEmailRateLimit(
    email: string,
    config: RateLimitConfig = { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 emails per hour
  ): Promise<RateLimitResult> {
    const key = `email:${email}`;
    return await this.checkRateLimit(key, config);
  }

  // Property view rate limiting
  async checkPropertyViewRateLimit(
    userId: string,
    propertyId: string,
    config: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 1 }, // 1 view per minute
  ): Promise<RateLimitResult> {
    const key = `property_view:${userId}:${propertyId}`;
    return await this.checkRateLimit(key, config);
  }

  // Search rate limiting
  async checkSearchRateLimit(
    userId: string,
    config: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 10 }, // 10 searches per minute
  ): Promise<RateLimitResult> {
    const key = `search:${userId}`;
    return await this.checkRateLimit(key, config);
  }

  // File upload rate limiting
  async checkUploadRateLimit(
    userId: string,
    config: RateLimitConfig = { windowMs: 60 * 60 * 1000, maxRequests: 20 }, // 20 uploads per hour
  ): Promise<RateLimitResult> {
    const key = `upload:${userId}`;
    return await this.checkRateLimit(key, config);
  }

  // Admin action rate limiting
  async checkAdminRateLimit(
    adminId: string,
    action: string,
    config: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 5 }, // 5 actions per minute
  ): Promise<RateLimitResult> {
    const key = `admin:${adminId}:${action}`;
    return await this.checkRateLimit(key, config);
  }

  // IP-based rate limiting
  async checkIpRateLimit(
    ip: string,
    endpoint: string,
    config: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
  ): Promise<RateLimitResult> {
    const key = `ip:${ip}:${endpoint}`;
    return await this.checkRateLimit(key, config);
  }

  // Reset rate limit for a key
  async resetRateLimit(key: string): Promise<void> {
    const rateLimitKey = `${this.RATE_LIMIT_PREFIX}${key}`;
    await this.redisService.del(rateLimitKey);
    this.logger.log(`Reset rate limit for key: ${key}`);
  }

  // Get rate limit info for a key
  async getRateLimitInfo(key: string): Promise<{
    current: number;
    limit: number;
    reset: number;
    windowMs: number;
  } | null> {
    const rateLimitKey = `${this.RATE_LIMIT_PREFIX}${key}`;
    const requests = await this.redisService.zrange(rateLimitKey, 0, -1);
    
    if (requests.length === 0) {
      return null;
    }

    const now = Date.now();
    const windowMs = 60 * 1000; // Default 1 minute window
    const windowStart = now - windowMs;
    
    const currentRequests = requests.filter(req => parseInt(req) >= windowStart);
    const oldestRequest = requests.length > 0 ? parseInt(requests[0]) : now;
    const reset = oldestRequest + windowMs;

    return {
      current: currentRequests.length,
      limit: 100, // Default limit
      reset,
      windowMs,
    };
  }

  // Get all rate limit keys
  async getAllRateLimitKeys(): Promise<string[]> {
    const pattern = `${this.RATE_LIMIT_PREFIX}*`;
    const keys = await this.redisService.getClient().keys(pattern);
    return keys.map(key => key.replace(this.RATE_LIMIT_PREFIX, ''));
  }

  // Get rate limit statistics
  async getRateLimitStats(): Promise<{
    totalKeys: number;
    activeKeys: number;
    blockedKeys: number;
  }> {
    const keys = await this.getAllRateLimitKeys();
    let activeKeys = 0;
    let blockedKeys = 0;

    for (const key of keys) {
      const info = await this.getRateLimitInfo(key);
      if (info) {
        activeKeys++;
        if (info.current >= info.limit) {
          blockedKeys++;
        }
      }
    }

    return {
      totalKeys: keys.length,
      activeKeys,
      blockedKeys,
    };
  }

  // Clean up expired rate limit entries
  async cleanupExpiredRateLimits(): Promise<number> {
    const keys = await this.getAllRateLimitKeys();
    let cleanedCount = 0;

    for (const key of keys) {
      const info = await this.getRateLimitInfo(key);
      if (!info || info.reset < Date.now()) {
        await this.resetRateLimit(key);
        cleanedCount++;
      }
    }

    this.logger.log(`Cleaned up ${cleanedCount} expired rate limits`);
    return cleanedCount;
  }

  // Block a key temporarily
  async blockKey(key: string, duration: number = 3600): Promise<void> {
    const blockKey = `block:${key}`;
    await this.redisService.set(blockKey, 'blocked', duration);
    this.logger.log(`Blocked key: ${key} for ${duration} seconds`);
  }

  // Check if a key is blocked
  async isKeyBlocked(key: string): Promise<boolean> {
    const blockKey = `block:${key}`;
    const blocked = await this.redisService.get(blockKey);
    return blocked !== null;
  }

  // Unblock a key
  async unblockKey(key: string): Promise<void> {
    const blockKey = `block:${key}`;
    await this.redisService.del(blockKey);
    this.logger.log(`Unblocked key: ${key}`);
  }
} 