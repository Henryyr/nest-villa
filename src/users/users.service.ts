// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

interface FindAllOptions {
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findAll(options: FindAllOptions = {}): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    return this.usersRepository.findAll(options);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.usersRepository.createUser(data);
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return this.usersRepository.updateUser(id, data);
  }

  async deleteUser(id: string): Promise<User> {
    return this.usersRepository.deleteUser(id);
  }
}
