import { Wishlist, Property, PropertyImage, Villa } from '@prisma/client';

export interface WishlistWithProperty {
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