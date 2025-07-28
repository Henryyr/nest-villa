import { Injectable } from '@nestjs/common';
import { NotFoundError, ConflictError } from '../../common/types/error.types';
import { UsersRepository } from './users.repository';
import { FindAllOptions } from '../../common/interfaces/find-all-options.interface';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto, UserListResponseDto } from './dto/user-response.dto';
import { CacheService } from '../redis/cache.service';
import { CachedUser } from 'common/interfaces/cache.interface';
import { SessionService } from '../redis/session.service';
import { QueueService } from '../redis/queue.service';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private cacheService: CacheService,
    private sessionService: SessionService,
    private queueService: QueueService,
  ) {}

  async findAll(options: FindAllOptions = {}): Promise<UserListResponseDto> {
    const result = await this.usersRepository.findAll(options);
    return {
      ...result,
      data: result.data.map(this.toUserResponseDto),
    };
  }

  async findById(id: string): Promise<UserResponseDto> {
    // Check cache first
    const cached = await this.cacheService.getCachedUser(id);
    if (cached) {
      return {
        id: cached.id,
        name: cached.name,
        email: cached.email,
        phone: cached.phone,
        role: cached.role as 'ADMIN' | 'OWNER' | 'CUSTOMER',
        avatarUrl: cached.avatarUrl,
        createdAt: cached.createdAt,
        updatedAt: cached.updatedAt,
      };
    }

    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundError('User');
    
    // Cache user data
    await this.cacheService.cacheUser(id, user);
    return this.toUserResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new NotFoundError('User');
    return this.toUserResponseDto(user);
  }

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    // Check for duplicate email
    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) throw new ConflictError('Email already in use');
    
    const user = await this.usersRepository.createUser(data);
    
    // Cache user data
    await this.cacheService.cacheUser(user.id, user as CachedUser);
    
    // Send welcome email via queue
    await this.queueService.addUserWelcomeJob(user.id, user.email);
    
    return this.toUserResponseDto(user);
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    // Check if user exists
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundError('User');
    
    const updated = await this.usersRepository.updateUser(id, data as Record<string, unknown>);
    
    // Invalidate cache
    await this.cacheService.invalidateUserCache(id);
    
    // Re-cache updated user
    await this.cacheService.cacheUser(id, updated as CachedUser);
    
    // Add profile update job to queue
    await this.queueService.addUserProfileUpdateJob(id, data as Record<string, unknown>);
    
    return this.toUserResponseDto(updated);
  }

  async deleteUser(id: string): Promise<UserResponseDto> {
    // Check if user exists
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundError('User');
    
    const deleted = await this.usersRepository.deleteUser(id);
    
    // Remove from cache
    await this.cacheService.invalidateUserCache(id);
    
    // Delete all user sessions
    await this.sessionService.deleteUserSessions(id);
    
    // Add account deletion job to queue
    await this.queueService.addUserJob({
      userId: id,
      action: 'account-deletion',
    });
    
    return this.toUserResponseDto(deleted);
  }

  private toUserResponseDto(user: User): UserResponseDto {
    // Exclude password and map to DTO
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...rest } = user;
    return rest as UserResponseDto;
  }
}
