import { IBaseRepository } from '../../../common/base-repository.interface';
import { AddWishlistDto } from '../dto/add-wishlist.dto';
import { WishlistResponseDto } from '../dto/wishlist-response.dto';
import { FindAllOptions } from '../../../common/find-all-options';

export interface IWishlistRepository extends IBaseRepository<any, AddWishlistDto, any, WishlistResponseDto> {
  addToWishlist(userId: string, propertyId: string): Promise<any>;
  removeFromWishlist(userId: string, propertyId: string): Promise<{ count: number }>;
  findByUserAndProperty(userId: string, propertyId: string): Promise<any | null>;
  propertyExists(propertyId: string): Promise<boolean>;
  findPropertyById(propertyId: string): Promise<any | null>;
  getWishlist(userId: string, options?: FindAllOptions): Promise<any[]>;
} 