import { User, Prisma } from '@prisma/client';
import { IBaseRepository } from './base-repository.interface';

export interface IUsersRepository extends IBaseRepository<User, Prisma.UserCreateInput, Prisma.UserUpdateInput> {
  findByEmail(email: string): Promise<User | null>;
} 