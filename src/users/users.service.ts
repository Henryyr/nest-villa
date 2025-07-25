import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { FindAllOptions } from '../../common/types';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto, UserListResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findAll(options: FindAllOptions = {}): Promise<UserListResponseDto> {
    const result = await this.usersRepository.findAll(options);
    return {
      ...result,
      data: result.data.map(this.toUserResponseDto),
    };
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.toUserResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    return this.toUserResponseDto(user);
  }

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    // Check for duplicate email
    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already in use');
    const user = await this.usersRepository.createUser(data);
    return this.toUserResponseDto(user);
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    // Check if user exists
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const updated = await this.usersRepository.updateUser(id, data);
    return this.toUserResponseDto(updated);
  }

  async deleteUser(id: string): Promise<UserResponseDto> {
    // Check if user exists
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const deleted = await this.usersRepository.deleteUser(id);
    return this.toUserResponseDto(deleted);
  }

  private toUserResponseDto(user: User): UserResponseDto {
    // Exclude password and map to DTO
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...rest } = user;
    return rest as UserResponseDto;
  }
}
