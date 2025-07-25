import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { WishlistRepository } from './wishlist.repository';
import { FindAllOptions } from '../../common/types';
import { WishlistResponseDto } from './dto/wishlist-response.dto';

@Injectable()
export class WishlistService {
  constructor(private wishlistRepository: WishlistRepository) {}

  async addToWishlist(userId: string, propertyId: string): Promise<WishlistResponseDto> {
    // Check if property exists
    const property = await this.wishlistRepository.propertyExists(propertyId);
    if (!property) throw new NotFoundException('Property not found');

    // Check for duplicate
    const existing = await this.wishlistRepository.findByUserAndProperty(userId, propertyId);
    if (existing) throw new ConflictException('Property already in wishlist');

    const wishlist = await this.wishlistRepository.addToWishlist(userId, propertyId);
    return this.toWishlistResponseDto(wishlist);
  }

  async removeFromWishlist(userId: string, propertyId: string): Promise<{ deleted: boolean }> {
    // Check if property exists
    const property = await this.wishlistRepository.propertyExists(propertyId);
    if (!property) throw new NotFoundException('Property not found');

    const result = await this.wishlistRepository.removeFromWishlist(userId, propertyId);
    return { deleted: result.count > 0 };
  }

  async getWishlist(userId: string, options: FindAllOptions = {}): Promise<WishlistResponseDto[]> {
    const wishlists = await this.wishlistRepository.getWishlist(userId, options);
    return wishlists.map(this.toWishlistResponseDto);
  }

  private toWishlistResponseDto(wishlist: any): WishlistResponseDto {
    return {
      id: wishlist.id,
      userId: wishlist.userId,
      property: wishlist.property && {
        id: wishlist.property.id,
        title: wishlist.property.title,
        location: wishlist.property.location,
        price: wishlist.property.price,
        images: wishlist.property.images,
        villa: wishlist.property.villa,
      },
    };
  }
} 