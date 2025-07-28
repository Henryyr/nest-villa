import { Wishlist, Property, PropertyImage, Villa, Favorite } from '@prisma/client';


export interface FindAllOptions {
  search?: string;
  page?: number;
  limit?: number;
} 

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export type WishlistWithProperty = Wishlist & {
  property: Property & {
    images: PropertyImage[];
    villa: Villa | null;
  };
};

export type FavoriteWithProperty = Favorite & {
  property: Property & {
    images: PropertyImage[];
    villa: Villa | null;
  };
};


export type PropertyWithRelations = Property & {
  images: PropertyImage[];
  villa: Villa | null;
};

export interface EphemeralMessageJob {
  to: string;
  from: string;
  content: string;
  propertyId?: string;
  timestamp: number;
}
