import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CacheService } from '../../cache/redis/cache.service';
import { SessionService } from '../../cache/redis/session.service';
import { QueueService } from '../../cache/redis/queue.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundError, ConflictError } from '../../shared/types/error.types';
import { User } from '@prisma/client';
import { Job } from 'bullmq';
import { TestUtils } from '../../test/utils/test-utils';

describe('UsersService Integration', () => {
  let service: UsersService;
  let repository: UsersRepository;
  let cacheService: CacheService;
  let sessionService: SessionService;
  let queueService: QueueService;
  let prismaService: PrismaService;

  const mockUser: User = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    phone: '+6281234567890',
    role: 'CUSTOMER',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateUserDto: CreateUserDto = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Password123!',
    phone: '+6281234567891',
    role: 'CUSTOMER',
  };

  const mockUpdateUserDto: UpdateUserDto = {
    name: 'Jane Updated',
    phone: '+6281234567892',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'IUsersRepository',
          useClass: UsersRepository,
        },
        {
          provide: CacheService,
          useValue: {
            getCachedUser: jest.fn(),
            cacheUser: jest.fn(),
            invalidateUserCache: jest.fn(),
          },
        },
        {
          provide: SessionService,
          useValue: {
            deleteUserSessions: jest.fn(),
          },
        },
        {
          provide: QueueService,
          useValue: {
            addUserWelcomeJob: jest.fn(),
            addUserProfileUpdateJob: jest.fn(),
            addUserJob: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
    cacheService = module.get<CacheService>(CacheService);
    sessionService = module.get<SessionService>(SessionService);
    queueService = module.get<QueueService>(QueueService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('should return paginated users from database', async () => {
      const mockUsers = [mockUser];
      const mockPaginatedResult = {
        data: mockUsers,
        total: 1,
        page: 1,
        limit: 10,
      };

      jest.spyOn(repository, 'findAll').mockResolvedValue(mockPaginatedResult);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].id).toBe(mockUser.id);
      expect(result.data[0].name).toBe(mockUser.name);
      expect(result.data[0].email).toBe(mockUser.email);
      expect(result.data[0]).not.toHaveProperty('password');
    });

    it('should handle empty results', async () => {
      const mockPaginatedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      jest.spyOn(repository, 'findAll').mockResolvedValue(mockPaginatedResult);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('findById', () => {
    it('should return user from cache if available', async () => {
      const cachedUser = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        role: mockUser.role,
        avatarUrl: mockUser.avatarUrl,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      jest.spyOn(cacheService, 'getCachedUser').mockResolvedValue(cachedUser);

      const result = await service.findById(mockUser.id);

      expect(result.id).toBe(mockUser.id);
      expect(result.name).toBe(mockUser.name);
      expect(result).not.toHaveProperty('password');
      expect(cacheService.getCachedUser).toHaveBeenCalledWith(mockUser.id);
    });

    it('should fetch from database and cache if not in cache', async () => {
      jest.spyOn(cacheService, 'getCachedUser').mockResolvedValue(null);
      jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(cacheService, 'cacheUser').mockResolvedValue();

      const result = await service.findById(mockUser.id);

      expect(result.id).toBe(mockUser.id);
      expect(result.name).toBe(mockUser.name);
      expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(cacheService.cacheUser).toHaveBeenCalledWith(mockUser.id, mockUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      jest.spyOn(cacheService, 'getCachedUser').mockResolvedValue(null);
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = TestUtils.createMockCreateUserDto();
      const mockUser = TestUtils.createMockUser();

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(mockUser);
      jest.spyOn(cacheService, 'cacheUser').mockResolvedValue();
      jest.spyOn(queueService, 'addUserWelcomeJob').mockResolvedValue({} as Job);

      const result = await service.createUser(createUserDto);

      expect(result).toEqual(mockUser);
      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(cacheService.cacheUser).toHaveBeenCalledWith(mockUser.id, mockUser);
      expect(queueService.addUserWelcomeJob).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('should throw ConflictError if email already exists', async () => {
      jest.spyOn(repository, 'findByEmail').mockResolvedValue(mockUser);

      await expect(service.createUser(mockCreateUserDto)).rejects.toThrow(ConflictError);
      expect(repository.findByEmail).toHaveBeenCalledWith(mockCreateUserDto.email);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user-1';
      const updateUserDto = TestUtils.createMockUpdateUserDto();
      const updatedUser = TestUtils.createMockUser({ ...updateUserDto, id: userId });

      jest.spyOn(repository, 'findById').mockResolvedValue(updatedUser);
      jest.spyOn(repository, 'update').mockResolvedValue(updatedUser);
      jest.spyOn(cacheService, 'cacheUser').mockResolvedValue();
      jest.spyOn(queueService, 'addUserProfileUpdateJob').mockResolvedValue({} as Job);

      const result = await service.updateUser(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(repository.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(cacheService.cacheUser).toHaveBeenCalledWith(userId, updatedUser);
      expect(queueService.addUserProfileUpdateJob).toHaveBeenCalledWith({
        userId,
        profileData: updateUserDto,
      });
    });

    it('should throw NotFoundError if user not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.updateUser('non-existent', mockUpdateUserDto)).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user-1';
      const mockUser = TestUtils.createMockUser({ id: userId });

      jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(repository, 'delete').mockResolvedValue(mockUser);
      jest.spyOn(cacheService, 'invalidateUserCache').mockResolvedValue();
      jest.spyOn(sessionService, 'deleteUserSessions').mockResolvedValue();
      jest.spyOn(queueService, 'addUserJob').mockResolvedValue({} as Job);

      const result = await service.deleteUser(userId);

      expect(result).toEqual(mockUser);
      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(repository.delete).toHaveBeenCalledWith(userId);
      expect(cacheService.invalidateUserCache).toHaveBeenCalledWith(userId);
      expect(sessionService.deleteUserSessions).toHaveBeenCalledWith(userId);
      expect(queueService.addUserJob).toHaveBeenCalledWith({
        action: 'delete',
        userId,
        userData: mockUser,
      });
    });

    it('should throw NotFoundError if user not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.deleteUser('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      jest.spyOn(repository, 'findByEmail').mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result).not.toHaveProperty('password');
      expect(repository.findByEmail).toHaveBeenCalledWith(mockUser.email);
    });

    it('should throw NotFoundError if user not found', async () => {
      jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundError);
    });
  });
});