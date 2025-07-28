import { Favorite, Property, PropertyImage, Villa } from '@prisma/client';

export type FavoriteWithProperty = Favorite & {
  property: Property & {
    images: PropertyImage[];
    villa: Villa | null;
  };
}; 