import { Prisma, Favorite, Property } from '@prisma/client';
import { FindAllOptions } from './find-all-options.interface';
import { IBaseRepository } from './base-repository.interface';

export interface IFavoriteRepository extends IBaseRepository<Favorite, Prisma.FavoriteCreateInput, Prisma.FavoriteUpdateInput> {
  // Custom methods for FavoriteService
  addToFavorite(userId: string, propertyId: string): Promise<Favorite>;
  removeFromFavorite(userId: string, propertyId: string): Promise<{ count: number }>;
  getFavorites(userId: string, options?: FindAllOptions): Promise<Favorite[]>;
  findByUserAndProperty(userId: string, propertyId: string): Promise<Favorite | null>;
  propertyExists(propertyId: string): Promise<boolean>;
  findPropertyById(propertyId: string): Promise<Property | null>;
} 