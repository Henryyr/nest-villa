import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { IWishlistRepository } from '../../shared/interfaces/wishlist-repository.interface';
import { FindAllOptions } from '../../shared/interfaces/find-all-options.interface';
import { WishlistWithProperty } from '../../shared/types/wishlist-with-property.type';
import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { Wishlist } from '@prisma/client';
import { CacheService } from '../../cache/redis/cache.service';
import { PubSubService } from '../../cache/redis/pubsub.service';

@Injectable()
export class WishlistService {
  constructor(
    @Inject('IWishlistRepository') private wishlistRepository: IWishlistRepository,
    private cacheService: CacheService,
    private pubSubService: PubSubService,
  ) {}

  async addToWishlist(userId: string, propertyId: string): Promise<WishlistResponseDto> {
    // Check if property exists
    const propertyExists = await this.wishlistRepository.propertyExists(propertyId);
    if (!propertyExists) throw new NotFoundException('Property not found');

    // Get property data for notification
    const property = await this.wishlistRepository.findPropertyById(propertyId);
    if (!property) throw new NotFoundException('Property not found');

    // Check for duplicate
    const existing = await this.wishlistRepository.findByUserAndProperty(userId, propertyId);
    if (existing) throw new ConflictException('Property already in wishlist');

    const wishlist = await this.wishlistRepository.addToWishlist(userId, propertyId);
    
    // Invalidate user wishlist cache specifically
    await this.cacheService.invalidateUserWishlistCache(userId);
    
    // Publish real-time update
    await this.pubSubService.publishUserNotification(userId, {
      type: 'wishlist_added',
      title: 'Property Added to Wishlist',
      message: `Property "${property.title}" has been added to your wishlist`,
      data: { propertyId, property },
    });
    
    return this.toWishlistResponseDto(wishlist);
  }

  async removeFromWishlist(userId: string, propertyId: string): Promise<{ deleted: boolean }> {
    // Check if property exists
    const propertyExists = await this.wishlistRepository.propertyExists(propertyId);
    if (!propertyExists) throw new NotFoundException('Property not found');

    // Get property data for notification
    const property = await this.wishlistRepository.findPropertyById(propertyId);
    if (!property) throw new NotFoundException('Property not found');

    const result = await this.wishlistRepository.removeFromWishlist(userId, propertyId);
    
    if (result.count > 0) {
      // Invalidate user wishlist cache specifically
      await this.cacheService.invalidateUserWishlistCache(userId);
      
      // Publish real-time update
      await this.pubSubService.publishUserNotification(userId, {
        type: 'wishlist_removed',
        title: 'Property Removed from Wishlist',
        message: `Property "${property.title}" has been removed from your wishlist`,
        data: { propertyId, property },
      });
    }
    
    return { deleted: result.count > 0 };
  }

  async getWishlist(userId: string, options: FindAllOptions = {}): Promise<WishlistResponseDto[]> {
    // Create cache key
    const cacheKey = `wishlist:${userId}:${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0 && 'id' in cached[0]) {
      return cached as WishlistResponseDto[];
    }
    
    const wishlists = await this.wishlistRepository.getWishlist(userId, options);
    const result = wishlists.map(this.toWishlistResponseDto);
    
    // Cache the results
    await this.cacheService.set(cacheKey, result, 1800); // Cache for 30 minutes
    
    return result;
  }

  private toWishlistResponseDto(wishlist: WishlistWithProperty | (Wishlist & { property?: undefined })): WishlistResponseDto {
    return {
      id: wishlist.id,
      userId: wishlist.userId,
      property: wishlist.property
        ? {
            id: wishlist.property.id,
            title: wishlist.property.title,
            location: wishlist.property.location,
            price: wishlist.property.price,
            images: wishlist.property.images,
            villa: wishlist.property.villa,
          }
        : null,
    };
  }
} 