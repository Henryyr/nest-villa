import { Injectable } from '@nestjs/common';
import { FavoriteRepository } from './favorite.repository';

@Injectable()
export class FavoriteService {
  constructor(private favoriteRepository: FavoriteRepository) {}

  addToFavorite(userId: string, propertyId: string) {
    return this.favoriteRepository.addToFavorite(userId, propertyId);
  }

  removeFromFavorite(userId: string, propertyId: string) {
    return this.favoriteRepository.removeFromFavorite(userId, propertyId);
  }

  getFavorite(userId: string) {
    return this.favoriteRepository.getFavorite(userId);
  }
} 