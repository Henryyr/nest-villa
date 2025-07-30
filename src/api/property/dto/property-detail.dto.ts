import { PropertyType } from '@prisma/client';

export interface VillaDetail {
  id: string;
  bedrooms: number;
  bathrooms: number;
  hasSwimmingPool: boolean;
}

export interface PropertyOwner {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export class PropertyDetailDto {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  type: PropertyType;
  latitude: number;
  longitude: number;
  images: string[];
  villa: VillaDetail | null;
  facilities: string[];
  owner: PropertyOwner;
  createdAt: Date;
  updatedAt: Date;
} 