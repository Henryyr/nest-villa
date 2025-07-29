import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisService } from './redis.service';
import { Logger } from '@nestjs/common';
import { CachedProperty, CachedUser, CachedLocation } from '../../common/interfaces/redis.interface';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly redisService: RedisService,
  ) {}

  // Property cache methods
  async cacheProperty(propertyId: string, propertyData: CachedProperty, ttl: number = 3600): Promise<void> {
    const key = `property:${propertyId}`;
    await this.cacheManager.set(key, propertyData, ttl);
    this.logger.log(`Cached property: ${propertyId}`);
  }

  async getCachedProperty(propertyId: string): Promise<CachedProperty | null> {
    const key = `property:${propertyId}`;
    const cached = await this.cacheManager.get(key);
    if (cached && typeof cached === 'object' && cached !== null && 'id' in cached) {
      this.logger.log(`Cache hit for property: ${propertyId}`);
      return cached as CachedProperty;
    }
    return null;
  }

  async invalidatePropertyCache(propertyId: string): Promise<void> {
    const key = `property:${propertyId}`;
    await this.cacheManager.del(key);
    this.logger.log(`Invalidated property cache: ${propertyId}`);
  }

  // Property list cache
  async cachePropertyList(filters: string, propertyList: CachedProperty[], ttl: number = 1800): Promise<void> {
    const key = `property_list:${filters}`;
    await this.cacheManager.set(key, propertyList, ttl);
    this.logger.log(`Cached property list with filters: ${filters}`);
  }

  async getCachedPropertyList(filters: string): Promise<CachedProperty[] | null> {
    const key = `property_list:${filters}`;
    const cached = await this.cacheManager.get(key);
    if (cached && Array.isArray(cached) && cached.length > 0 && 'id' in cached[0]) {
      this.logger.log(`Cache hit for property list with filters: ${filters}`);
      return cached as CachedProperty[];
    }
    return null;
  }

  // User cache methods
  async cacheUser(userId: string, userData: CachedUser, ttl: number = 7200): Promise<void> {
    const key = RedisService.getUserCacheKey(userId);
    await this.cacheManager.set(key, userData, ttl);
    this.logger.log(`Cached user: ${userId}`);
  }

  async getCachedUser(userId: string): Promise<CachedUser | null> {
    const key = RedisService.getUserCacheKey(userId);
    const cached = await this.cacheManager.get(key);
    if (cached && typeof cached === 'object' && cached !== null && 'id' in cached) {
      this.logger.log(`Cache hit for user: ${userId}`);
      return cached as CachedUser;
    }
    return null;
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const key = RedisService.getUserCacheKey(userId);
    await this.cacheManager.del(key);
    
    // Also invalidate user-specific caches
    await this.invalidateUserFavoritesCache(userId);
    await this.invalidateUserWishlistCache(userId);
    
    this.logger.log(`Invalidated user cache: ${userId}`);
  }

  // Invalidate user favorites cache
  async invalidateUserFavoritesCache(userId: string): Promise<void> {
    // Clear all favorites cache keys for this user
    const patterns = [
      `favorites:${userId}:*`,
      `favorites:${userId}`,
    ];
    
    for (const pattern of patterns) {
      const deleted = await this.redisService.bulkDeleteByPattern(pattern);
      this.logger.log(`Invalidated ${deleted} favorites cache keys for user: ${userId} with pattern: ${pattern}`);
    }
  }

  // Invalidate user wishlist cache
  async invalidateUserWishlistCache(userId: string): Promise<void> {
    // Clear all wishlist cache keys for this user
    const patterns = [
      `wishlist:${userId}:*`,
      `wishlist:${userId}`,
    ];
    
    for (const pattern of patterns) {
      const deleted = await this.redisService.bulkDeleteByPattern(pattern);
      this.logger.log(`Invalidated ${deleted} wishlist cache keys for user: ${userId} with pattern: ${pattern}`);
    }
  }

  // Popular properties cache (frequently viewed)
  async incrementPropertyViews(propertyId: string): Promise<number> {
    const key = `property_views:${propertyId}`;
    const views = await this.redisService.incr(key);
    await this.redisService.expire(key, 86400 * 30); // 30 days
    return views;
  }

  async getPropertyViews(propertyId: string): Promise<number> {
    const key = `property_views:${propertyId}`;
    const views = await this.redisService.get(key);
    return views ? parseInt(views) : 0;
  }

  async getPopularProperties(limit: number = 10): Promise<string[]> {
    const pattern = 'property_views:*';
    const keys = await this.redisService.getClient().keys(pattern);
    
    if (keys.length === 0) return [];

    const pipeline = this.redisService.getClient().pipeline();
    keys.forEach(key => pipeline.get(key));
    const results = await pipeline.exec();

    if (!results) return [];

    const propertyViews = results
      .map((result, index) => ({
        propertyId: keys[index].replace('property_views:', ''),
        views: parseInt(result[1] as string || '0'),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
      .map(item => item.propertyId);

    return propertyViews;
  }

  // Search suggestions cache
  async cacheSearchSuggestions(query: string, suggestions: string[], ttl: number = 3600): Promise<void> {
    const key = `search_suggestions:${query.toLowerCase()}`;
    await this.cacheManager.set(key, suggestions, ttl);
  }

  async getCachedSearchSuggestions(query: string): Promise<string[] | null> {
    const key = `search_suggestions:${query.toLowerCase()}`;
    const cached = await this.cacheManager.get(key);
    if (cached && Array.isArray(cached)) {
      return cached as string[];
    }
    return null;
  }

  // Location cache
  async cacheLocationData(location: string, data: CachedLocation, ttl: number = 86400): Promise<void> {
    const key = `location:${location.toLowerCase()}`;
    await this.cacheManager.set(key, data, ttl);
  }

  async getCachedLocationData(location: string): Promise<CachedLocation | null> {
    const key = `location:${location.toLowerCase()}`;
    const cached = await this.cacheManager.get(key);
    if (cached && typeof cached === 'object' && cached !== null && 'name' in cached) {
      return cached as CachedLocation;
    }
    return null;
  }

  // Generic cache methods
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async get(key: string): Promise<unknown> {
    const cached = await this.cacheManager.get(key);
    return cached;
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    // Clear all cache keys
    const keys = await this.redisService.getClient().keys('*');
    if (keys.length > 0) {
      await this.redisService.getClient().del(...keys);
    }
  }

  // Cache statistics
  async getCacheStats(): Promise<{ hits: number; misses: number; keys: number }> {
    const keys = await this.redisService.getClient().keys('*');
    return {
      hits: 0, // Would need to implement hit tracking
      misses: 0, // Would need to implement miss tracking
      keys: keys.length,
    };
  }
} 