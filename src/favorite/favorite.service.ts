import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { FavoriteRepository } from './favorite.repository';
import { FavoriteWithProperty } from '../../common/types/favorite-with-property.type';
import { FindAllOptions } from '../../common/interfaces/find-all-options.interface';
import { FavoriteResponseDto } from './dto/favorite-response.dto';
import { Favorite } from '@prisma/client';
import { CacheService } from '../redis/cache.service';
import { PubSubService } from '../redis/pubsub.service';

@Injectable()
export class FavoriteService {
  constructor(
    private favoriteRepository: FavoriteRepository,
    private cacheService: CacheService,
    private pubSubService: PubSubService,
  ) {}

  async addToFavorite(userId: string, propertyId: string): Promise<FavoriteResponseDto> {
    // Check if property exists
    const property = await this.favoriteRepository.propertyExists(propertyId);
    if (!property) throw new NotFoundException('Property not found');

    // Check for duplicate
    const existing = await this.favoriteRepository.findByUserAndProperty(userId, propertyId);
    if (existing) throw new ConflictException('Property already in favorites');

    const favorite = await this.favoriteRepository.addToFavorite(userId, propertyId);
    
    // Invalidate user favorites cache specifically
    await this.cacheService.invalidateUserFavoritesCache(userId);
    
    // Publish real-time update
    await this.pubSubService.publishUserNotification(userId, {
      type: 'favorite_added',
      title: 'Property Added to Favorites',
      message: `Property "${property.title}" has been added to your favorites`,
      data: { propertyId, property },
    });
    
    return this.toFavoriteResponseDto(favorite);
  }

  async removeFromFavorite(userId: string, propertyId: string): Promise<{ deleted: boolean }> {
    // Check if property exists
    const property = await this.favoriteRepository.propertyExists(propertyId);
    if (!property) throw new NotFoundException('Property not found');

    const result = await this.favoriteRepository.removeFromFavorite(userId, propertyId);
    
    if (result.count > 0) {
      // Invalidate user favorites cache specifically
      await this.cacheService.invalidateUserFavoritesCache(userId);
      
      // Publish real-time update
      await this.pubSubService.publishUserNotification(userId, {
        type: 'favorite_removed',
        title: 'Property Removed from Favorites',
        message: `Property "${property.title}" has been removed from your favorites`,
        data: { propertyId, property },
      });
    }
    
    return { deleted: result.count > 0 };
  }

  async getFavorite(userId: string, options: FindAllOptions = {}): Promise<FavoriteResponseDto[]> {
    // Create a more consistent cache key
    const cacheKey = `favorites:${userId}:${JSON.stringify(options || {})}`;
    
    // Check cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0 && 'id' in cached[0]) {
      console.log(`Cache hit for favorites: ${userId}, found ${cached.length} items`);
      return cached as FavoriteResponseDto[];
    }
    
    console.log(`Cache miss for favorites: ${userId}, fetching from database`);
    const favorites = await this.favoriteRepository.getFavorite(userId, options);
    console.log(`Found ${favorites.length} favorites in database for user: ${userId}`);
    
    const result = favorites.map(this.toFavoriteResponseDto);
    
    // Cache the results only if we have data
    if (result.length > 0) {
      await this.cacheService.set(cacheKey, result, 1800); // Cache for 30 minutes
      console.log(`Cached ${result.length} favorites for user: ${userId}`);
    }
    
    return result;
  }

  private toFavoriteResponseDto(favorite: FavoriteWithProperty | (Favorite & { property?: undefined })): FavoriteResponseDto {
    return {
      id: favorite?.id ?? '',
      userId: favorite?.userId ?? '',
      property: favorite?.property
        ? {
            id: favorite.property.id,
            title: favorite.property.title,
            location: favorite.property.location,
            price: favorite.property.price,
            images: favorite.property.images,
            villa: favorite.property.villa,
          }
        : null,
    };
  }
} 