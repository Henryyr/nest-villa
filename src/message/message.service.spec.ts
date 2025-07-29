import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { MessageRepository } from './message.repository';
import { PubSubService } from '../redis/pubsub.service';
import { QueueService } from '../redis/queue.service';
import { CacheService } from '../redis/cache.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { User, Message } from '@prisma/client';
import { Job } from 'bullmq';

describe('MessageService', () => {
  let service: MessageService;
  let repository: MessageRepository;
  let pubSubService: PubSubService;
  let queueService: QueueService;
  let cacheService: CacheService;

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

  const mockAdminUser: User = {
    ...mockUser,
    id: 'admin-1',
    role: 'ADMIN',
  };

  const mockMessage = {
    id: 'msg-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    content: 'Hello there!',
    propertyId: null,
    createdAt: new Date(),
  };

  const mockConversation = [
    {
      id: 'msg-1',
      senderId: 'user-1',
      receiverId: 'user-2',
      content: 'Hello!',
      propertyId: null,
      createdAt: new Date(),
    },
    {
      id: 'msg-2',
      senderId: 'user-2',
      receiverId: 'user-1',
      content: 'Hi there!',
      propertyId: null,
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: MessageRepository,
          useValue: {
            createMessage: jest.fn(),
            getMessagesBetweenUsers: jest.fn(),
            getUserConversations: jest.fn(),
          },
        },
        {
          provide: PubSubService,
          useValue: {
            publishMessage: jest.fn(),
          },
        },
        {
          provide: QueueService,
          useValue: {
            addMessageJob: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    repository = module.get<MessageRepository>(MessageRepository);
    pubSubService = module.get<PubSubService>(PubSubService);
    queueService = module.get<QueueService>(QueueService);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEphemeralMessage', () => {
    it('should send ephemeral message successfully', async () => {
      jest.spyOn(queueService, 'addMessageJob').mockResolvedValue({} as Job);
      jest.spyOn(pubSubService, 'publishMessage').mockResolvedValue();

      const result = await service.sendEphemeralMessage(
        mockUser,
        'user-2',
        'Hello ephemeral!',
        'property-1'
      );

      expect(result).toEqual({ status: 'queued' });
      expect(queueService.addMessageJob).toHaveBeenCalledWith({
        type: 'ephemeral-message',
        to: 'user-2',
        from: 'user-1',
        content: 'Hello ephemeral!',
        propertyId: 'property-1',
        timestamp: expect.any(Number),
      });
      expect(pubSubService.publishMessage).toHaveBeenCalledWith('chat_user-2', {
        type: 'ephemeral',
        from: 'user-1',
        content: 'Hello ephemeral!',
        propertyId: 'property-1',
        timestamp: expect.any(Number),
      });
    });

    it('should send ephemeral message without propertyId', async () => {
      jest.spyOn(queueService, 'addMessageJob').mockResolvedValue({} as Job);
      jest.spyOn(pubSubService, 'publishMessage').mockResolvedValue();

      const result = await service.sendEphemeralMessage(
        mockUser,
        'user-2',
        'Hello ephemeral!'
      );

      expect(result).toEqual({ status: 'queued' });
      expect(queueService.addMessageJob).toHaveBeenCalledWith({
        type: 'ephemeral-message',
        to: 'user-2',
        from: 'user-1',
        content: 'Hello ephemeral!',
        propertyId: undefined,
        timestamp: expect.any(Number),
      });
    });

    it('should throw ForbiddenException when admin tries to send message', async () => {
      await expect(
        service.sendEphemeralMessage(mockAdminUser, 'user-2', 'Hello!')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('sendMessage', () => {
    it('should send persistent message successfully', async () => {
      jest.spyOn(repository, 'createMessage').mockResolvedValue(mockMessage);
      jest.spyOn(pubSubService, 'publishMessage').mockResolvedValue();
      jest.spyOn(repository, 'getMessagesBetweenUsers').mockResolvedValue(mockConversation);
      jest.spyOn(cacheService, 'set').mockResolvedValue();

      const result = await service.sendMessage(
        mockUser,
        'user-2',
        'Hello persistent!',
        'property-1'
      );

      expect(result).toEqual(mockMessage);
      expect(repository.createMessage).toHaveBeenCalledWith(
        'user-1',
        'user-2',
        'Hello persistent!',
        'property-1'
      );
      expect(pubSubService.publishMessage).toHaveBeenCalledWith('chat_user-2', {
        type: 'new_message',
        message: mockMessage,
        timestamp: expect.any(Number),
      });
      expect(cacheService.set).toHaveBeenCalledWith(
        'conversation:user-1:user-2:property-1',
        mockConversation,
        3600
      );
    });

    it('should send message without propertyId', async () => {
      jest.spyOn(repository, 'createMessage').mockResolvedValue(mockMessage);
      jest.spyOn(pubSubService, 'publishMessage').mockResolvedValue();
      jest.spyOn(repository, 'getMessagesBetweenUsers').mockResolvedValue(mockConversation);
      jest.spyOn(cacheService, 'set').mockResolvedValue();

      const result = await service.sendMessage(
        mockUser,
        'user-2',
        'Hello persistent!'
      );

      expect(result).toEqual(mockMessage);
      expect(cacheService.set).toHaveBeenCalledWith(
        'conversation:user-1:user-2:general',
        mockConversation,
        3600
      );
    });

    it('should throw ForbiddenException when admin tries to send message', async () => {
      await expect(
        service.sendMessage(mockAdminUser, 'user-2', 'Hello!')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getConversation', () => {
    it('should return conversation from cache if available', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(mockConversation);

      const result = await service.getConversation(mockUser, 'user-2', 'property-1');

      expect(result).toEqual(mockConversation);
      expect(cacheService.get).toHaveBeenCalledWith('conversation:user-1:user-2:property-1');
      expect(repository.getMessagesBetweenUsers).not.toHaveBeenCalled();
    });

    it('should return conversation from database if not in cache', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'getMessagesBetweenUsers').mockResolvedValue(mockConversation);
      jest.spyOn(cacheService, 'set').mockResolvedValue();

      const result = await service.getConversation(mockUser, 'user-2', 'property-1');

      expect(result).toEqual(mockConversation);
      expect(repository.getMessagesBetweenUsers).toHaveBeenCalledWith('user-1', 'user-2', 'property-1');
      expect(cacheService.set).toHaveBeenCalledWith(
        'conversation:user-1:user-2:property-1',
        mockConversation,
        3600
      );
    });

    it('should throw NotFoundException when no conversation found', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'getMessagesBetweenUsers').mockResolvedValue([]);

      await expect(
        service.getConversation(mockUser, 'user-2', 'property-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not participant', async () => {
      const otherConversation = [
        {
          id: 'msg-3',
          senderId: 'user-3',
          receiverId: 'user-4',
          content: 'Hello!',
          propertyId: null,
          createdAt: new Date(),
        },
      ];

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'getMessagesBetweenUsers').mockResolvedValue(otherConversation);

      await expect(
        service.getConversation(mockUser, 'user-2', 'property-1')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when admin tries to access messages', async () => {
      await expect(
        service.getConversation(mockAdminUser, 'user-2', 'property-1')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getUserConversations', () => {
    const mockConversations = mockConversation;

    it('should return user conversations', async () => {
      jest.spyOn(repository, 'getUserConversations').mockResolvedValue(mockConversations as Message[]);

      const result = await service.getUserConversations(mockUser);

      expect(result).toEqual(mockConversations);
      expect(repository.getUserConversations).toHaveBeenCalledWith('user-1');
    });

    it('should throw ForbiddenException when admin tries to access conversations', async () => {
      await expect(
        service.getUserConversations(mockAdminUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });
}); 