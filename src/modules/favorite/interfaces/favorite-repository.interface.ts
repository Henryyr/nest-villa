import { IBaseRepository } from '../../../common/base-repository.interface';
import { AddFavoriteDto } from '../dto/add-favorite.dto';
import { FavoriteResponseDto } from '../dto/favorite-response.dto';

export interface IFavoriteRepository extends IBaseRepository<any, AddFavoriteDto, any, FavoriteResponseDto> {
  addToFavorite(userId: string, propertyId: string): Promise<any>;
  removeFromFavorite(userId: string, propertyId: string): Promise<{ count: number }>;
  findByUserAndProperty(userId: string, propertyId: string): Promise<any | null>;
  propertyExists(propertyId: string): Promise<boolean>;
  findPropertyById(propertyId: string): Promise<any | null>;
  getFavorites(userId: string, options?: any): Promise<any[]>;
} 