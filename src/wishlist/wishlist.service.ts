import { Injectable } from '@nestjs/common';
import { WishlistRepository } from './wishlist.repository';

@Injectable()
export class WishlistService {
  constructor(private wishlistRepository: WishlistRepository) {}

  addToWishlist(userId: string, propertyId: string) {
    return this.wishlistRepository.addToWishlist(userId, propertyId);
  }

  removeFromWishlist(userId: string, propertyId: string) {
    return this.wishlistRepository.removeFromWishlist(userId, propertyId);
  }

  getWishlist(userId: string) {
    return this.wishlistRepository.getWishlist(userId);
  }
} 