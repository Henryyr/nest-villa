import { FindAllOptions } from './find-all-options.interface';
import { Prisma } from '@prisma/client';

interface Facility {
  id: string;
  name: string;
  propertyCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFacilityRepository {
  findAll(options?: FindAllOptions): Promise<{
    data: Facility[];
    total: number;
    page: number;
    limit: number;
  }>;
  
  findById(id: string): Promise<Facility | null>;
  
  findByName(name: string): Promise<Facility | null>;
  
  create(data: Prisma.FacilityCreateInput): Promise<Facility>;
  
  update(id: string, data: Prisma.FacilityUpdateInput): Promise<Facility>;
  
  delete(id: string): Promise<Facility>;
  
  addToProperty(propertyId: string, facilityIds: string[]): Promise<void>;
  
  removeFromProperty(propertyId: string, facilityIds: string[]): Promise<void>;
  
  getPropertyFacilities(propertyId: string): Promise<Facility[]>;
  
  getAvailableFacilitiesForProperty(propertyId: string): Promise<Facility[]>;
} 