import { Prisma } from '@prisma/client';
import { FindAllOptions } from './find-all-options.interface';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IBaseRepository<T, CreateInput = Record<string, unknown>, UpdateInput = Record<string, unknown>> {
  findAll(options?: FindAllOptions): Promise<PaginatedResult<T>>;
  findById(id: string): Promise<T | null>;
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T>;
  delete(id: string): Promise<T>;
}