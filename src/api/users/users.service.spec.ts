import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CacheService } from '../../cache/redis/cache.service';
import { SessionService } from '../../cache/redis/session.service';
import { QueueService } from '../../cache/redis/queue.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundError, ConflictError } from '../../shared/types/error.types';
import { User } from '@prisma/client';
import { Job } from 'bullmq';
import { TestUtils } from '../../test/utils/test-utils';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;
  let cacheService: CacheService;
  let sessionService: SessionService;
  let queueService: QueueService;

  const mockUser: User = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    phone: '08123456789',
    role: 'CUSTOMER',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCachedUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '08123456789',
    role: 'CUSTOMER',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
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
            createSession: jest.fn(),
            deleteSession: jest.fn(),
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
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
    cacheService = module.get<CacheService>(CacheService);
    sessionService = module.get<SessionService>(SessionService);
    queueService = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      const mockResult = {
        data: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest.spyOn(repository, 'findAll').mockResolvedValue(mockResult);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        ...mockResult,
        data: [{
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          phone: mockUser.phone,
          role: mockUser.role,
          avatarUrl: mockUser.avatarUrl,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        }],
      });
    });
  });

  describe('findById', () => {
    it('should return user from cache if available', async () => {
      jest.spyOn(cacheService, 'getCachedUser').mockResolvedValue(mockCachedUser);
      jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(cacheService, 'cacheUser').mockResolvedValue();

      const result = await service.findById('user-1');

      expect(result).toEqual({
        id: mockCachedUser.id,
        name: mockCachedUser.name,
        email: mockCachedUser.email,
        phone: mockCachedUser.phone,
        role: mockCachedUser.role,
        avatarUrl: mockCachedUser.avatarUrl,
        createdAt: mockCachedUser.createdAt,
        updatedAt: mockCachedUser.updatedAt,
      });
      expect(cacheService.getCachedUser).toHaveBeenCalledWith('user-1');
      expect(repository.findById).not.toHaveBeenCalled();
    });

    it('should return user from database if not in cache', async () => {
      jest.spyOn(cacheService, 'getCachedUser').mockResolvedValue(null);
      jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(cacheService, 'cacheUser').mockResolvedValue();

      const result = await service.findById('user-1');

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        role: mockUser.role,
        avatarUrl: mockUser.avatarUrl,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(repository.findById).toHaveBeenCalledWith('user-1');
      expect(cacheService.cacheUser).toHaveBeenCalledWith('user-1', mockUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      jest.spyOn(cacheService, 'getCachedUser').mockResolvedValue(null);
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      jest.spyOn(repository, 'findByEmail').mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        role: mockUser.role,
        avatarUrl: mockUser.avatarUrl,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw NotFoundError if user not found', async () => {
      jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = TestUtils.createMockCreateUserDto();
      const mockUser = TestUtils.createMockUser();

      jest.spyOn(repository, 'create').mockResolvedValue(mockUser);
      jest.spyOn(cacheService, 'cacheUser').mockResolvedValue();
      jest.spyOn(queueService, 'addUserWelcomeJob').mockResolvedValue({} as Job);

      const result = await service.createUser(createUserDto);

      expect(result).toEqual(mockUser);
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(cacheService.cacheUser).toHaveBeenCalledWith(mockUser.id, mockUser);
      expect(queueService.addUserWelcomeJob).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('should throw ConflictError if user with email already exists', async () => {
      const createUserDto = TestUtils.createMockCreateUserDto();

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(TestUtils.createMockUser());

      await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictError);
      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
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
      expect(repository.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(cacheService.cacheUser).toHaveBeenCalledWith(userId, updatedUser);
      expect(queueService.addUserProfileUpdateJob).toHaveBeenCalledWith({
        userId,
        profileData: updateUserDto,
      });
    });

    it('should throw NotFoundError if user not found', async () => {
      const userId = 'user-1';
      const updateUserDto = TestUtils.createMockUpdateUserDto();

      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.updateUser(userId, updateUserDto)).rejects.toThrow(NotFoundError);
      expect(repository.findById).toHaveBeenCalledWith(userId);
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
      const userId = 'user-1';

      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.deleteUser(userId)).rejects.toThrow(NotFoundError);
      expect(repository.findById).toHaveBeenCalledWith(userId);
    });
  });
}); 