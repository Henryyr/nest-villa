import { Property, PropertyImage, Villa } from '@prisma/client';

export type PropertyWithRelations = Property & {
  images: PropertyImage[];
  villa: Villa | null;
}; 