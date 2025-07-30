import { Property, Prisma } from '@prisma/client';
import { IBaseRepository } from './base-repository.interface';
import { FindAllOptions } from './find-all-options.interface';

export interface IPropertyRepository extends IBaseRepository<Property, Prisma.PropertyCreateInput, Prisma.PropertyUpdateInput> {
  findByOwnerId(ownerId: string, options?: FindAllOptions): Promise<{ data: any[]; total: number; page: number; limit: number }>;
} 