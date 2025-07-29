import { Property, Prisma } from '@prisma/client';
import { IBaseRepository } from './base-repository.interface';

export interface IPropertyRepository extends IBaseRepository<Property, Prisma.PropertyCreateInput, Prisma.PropertyUpdateInput> {
  // Add any property-specific methods here if needed
} 