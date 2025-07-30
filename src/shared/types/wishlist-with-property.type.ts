import { Wishlist, Property, PropertyImage, Villa } from '@prisma/client';

export type WishlistWithProperty = Wishlist & {
  property: Property & {
    images: PropertyImage[];
    villa: Villa | null;
  };
}; 