// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

interface FindAllOptions {
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findAll(options: FindAllOptions = {}): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    return this.usersRepository.findAll(options);
  }

  async findById(id: string): Promise<any | null> {
    return this.usersRepository.findById(id);
  }

  async findByEmail(email: string): Promise<any | null> {
    return this.usersRepository.findByEmail(email);
  }

  async createUser(data: any): Promise<any> {
    return this.usersRepository.createUser(data);
  }

  async updateUser(id: string, data: any): Promise<any> {
    return this.usersRepository.updateUser(id, data);
  }

  async deleteUser(id: string): Promise<any> {
    return this.usersRepository.deleteUser(id);
  }
}
