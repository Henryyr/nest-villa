import { Prisma, Wishlist, Property } from '@prisma/client';
import { FindAllOptions } from './find-all-options.interface';
import { IBaseRepository } from './base-repository.interface';

export interface IWishlistRepository extends IBaseRepository<Wishlist, Prisma.WishlistCreateInput, Prisma.WishlistUpdateInput> {
  // Custom methods for WishlistService
  addToWishlist(userId: string, propertyId: string): Promise<Wishlist>;
  removeFromWishlist(userId: string, propertyId: string): Promise<{ count: number }>;
  getWishlist(userId: string, options?: FindAllOptions): Promise<Wishlist[]>;
  findByUserAndProperty(userId: string, propertyId: string): Promise<Wishlist | null>;
  propertyExists(propertyId: string): Promise<boolean>;
  findPropertyById(propertyId: string): Promise<Property | null>;
} 