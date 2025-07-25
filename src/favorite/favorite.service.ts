import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { FavoriteRepository } from './favorite.repository';
import { FavoriteWithProperty, FindAllOptions } from '../../common/types';
import { FavoriteResponseDto } from './dto/favorite-response.dto';
import { Favorite } from '@prisma/client';

@Injectable()
export class FavoriteService {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async addToFavorite(userId: string, propertyId: string): Promise<FavoriteResponseDto> {
    // Check if property exists
    const property = await this.favoriteRepository.propertyExists(propertyId);
    if (!property) throw new NotFoundException('Property not found');

    // Check for duplicate
    const existing = await this.favoriteRepository.findByUserAndProperty(userId, propertyId);
    if (existing) throw new ConflictException('Property already in favorites');

    const favorite = await this.favoriteRepository.addToFavorite(userId, propertyId);
    return this.toFavoriteResponseDto(favorite);
  }

  async removeFromFavorite(userId: string, propertyId: string): Promise<{ deleted: boolean }> {
    // Check if property exists
    const property = await this.favoriteRepository.propertyExists(propertyId);
    if (!property) throw new NotFoundException('Property not found');

    const result = await this.favoriteRepository.removeFromFavorite(userId, propertyId);
    return { deleted: result.count > 0 };
  }

  async getFavorite(userId: string, options: FindAllOptions = {}): Promise<FavoriteResponseDto[]> {
    const favorites = await this.favoriteRepository.getFavorite(userId, options);
    return favorites.map(this.toFavoriteResponseDto);
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