import { FindAllOptions } from './find-all-options.interface';
import { Prisma } from '@prisma/client';

export interface IFacilityRepository {
  findAll(options?: FindAllOptions): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }>;
  
  findById(id: string): Promise<any>;
  
  findByName(name: string): Promise<any>;
  
  create(data: Prisma.FacilityCreateInput): Promise<any>;
  
  update(id: string, data: Prisma.FacilityUpdateInput): Promise<any>;
  
  delete(id: string): Promise<any>;
  
  addToProperty(propertyId: string, facilityIds: string[]): Promise<void>;
  
  removeFromProperty(propertyId: string, facilityIds: string[]): Promise<void>;
  
  getPropertyFacilities(propertyId: string): Promise<any[]>;
  
  getAvailableFacilitiesForProperty(propertyId: string): Promise<any[]>;
} 