// Define proper types for cached data
export interface CachedProperty {
    id: string;
    title: string;
    description: string;
    location: string;
    price: number;
    type: string;
    images?: { id: string; url: string; propertyId: string; }[];
    villa?: { id: string; bedrooms: number; bathrooms: number; hasSwimmingPool: boolean; } | null;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
    [key: string]: unknown;
  }
  
  export interface CachedUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    avatarUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: unknown;
  }
  
  export interface CachedLocation {
    name: string;
    coordinates?: { lat: number; lng: number };
    properties?: string[];
    [key: string]: unknown;
  }
  