import { Favorite, Property, PropertyImage, Villa } from '@prisma/client';

export interface FavoriteWithProperty {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: Date;
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
    images?: any[];
    villa?: any;
  };
} 