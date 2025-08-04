import { Prisma, User } from '@prisma/client';

export interface IAuthRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  createUser(data: Prisma.UserCreateInput): Promise<User>;
  updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User>;
} 