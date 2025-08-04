import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { MessageRepository } from './message.repository';
import { PubSubService } from '../../cache/redis/pubsub.service';
import { QueueService } from '../../cache/redis/queue.service';
import { CacheService } from '../../cache/redis/cache.service';

import { Job } from 'bull';
import * as TestUtils from './message.test-utils';

describe('MessageService Integration', () => {
  let service: MessageService;
  let repository: MessageRepository;
  let pubSubService: PubSubService;
  let queueService: QueueService;
  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'CUSTOMER',
  };

  const mockReceiver = {
    id: 'user-2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'OWNER',
  };

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
            getConversation: jest.fn(),
          },
        },
        {
          provide: PubSubService,
          useValue: {
            publishMessage: jest.fn(),
            publishUserNotification: jest.fn(),
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
            invalidateUserCache: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    repository = module.get<MessageRepository>(MessageRepository);
    pubSubService = module.get<PubSubService>(PubSubService);
    queueService = module.get<QueueService>(QueueService);
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockSendMessageDto = TestUtils.createMockSendMessageDto();
      const mockMessage = TestUtils.createMockMessage();

      jest.spyOn(repository, 'createMessage').mockResolvedValue(mockMessage);
      jest.spyOn(pubSubService, 'publishMessage').mockResolvedValue();
      jest.spyOn(queueService, 'addMessageJob').mockResolvedValue({} as Job);

      const result = await service.sendMessage(
        mockUser, 
        mockSendMessageDto.receiverId, 
        mockSendMessageDto.content, 
        mockSendMessageDto.propertyId
      );

      expect(result).toEqual(mockMessage);
      expect(repository.createMessage).toHaveBeenCalledWith({
        senderId: mockUser.id,
        receiverId: mockSendMessageDto.receiverId,
        content: mockSendMessageDto.content,
        propertyId: mockSendMessageDto.propertyId,
      });
      expect(pubSubService.publishMessage).toHaveBeenCalledWith('message', {
        type: 'new_message',
        data: mockMessage,
      });
      expect(queueService.addMessageJob).toHaveBeenCalledWith({
        action: 'send',
        messageData: mockMessage,
      });
    });

    it('should send message without property successfully', async () => {
      const messageWithoutProperty = TestUtils.createMockSendMessageDto();
      delete messageWithoutProperty.propertyId;
      const mockMessage = TestUtils.createMockMessage();

      jest.spyOn(repository, 'createMessage').mockResolvedValue(mockMessage);
      jest.spyOn(pubSubService, 'publishMessage').mockResolvedValue();
      jest.spyOn(queueService, 'addMessageJob').mockResolvedValue({} as Job);

      const result = await service.sendMessage(
        mockUser, 
        messageWithoutProperty.receiverId, 
        messageWithoutProperty.content
      );

      expect(result).toEqual(mockMessage);
      expect(repository.createMessage).toHaveBeenCalledWith({
        senderId: mockUser.id,
        receiverId: messageWithoutProperty.receiverId,
        content: messageWithoutProperty.content,
        propertyId: undefined,
      });
    });
  });

  describe('sendEphemeralMessage', () => {
    it('should send ephemeral message successfully', async () => {
      const mockSendEphemeralMessageDto = TestUtils.createMockSendEphemeralMessageDto();

      jest.spyOn(pubSubService, 'publishMessage').mockResolvedValue();
      jest.spyOn(queueService, 'addMessageJob').mockResolvedValue({} as Job);

      await service.sendEphemeralMessage(
        mockUser, 
        mockSendEphemeralMessageDto.receiverId, 
        mockSendEphemeralMessageDto.content, 
        mockSendEphemeralMessageDto.propertyId
      );

      expect(pubSubService.publishMessage).toHaveBeenCalledWith('ephemeral_message', {
        type: 'ephemeral_message',
        data: {
          senderId: mockUser.id,
          receiverId: mockSendEphemeralMessageDto.receiverId,
          content: mockSendEphemeralMessageDto.content,
          propertyId: mockSendEphemeralMessageDto.propertyId,
        },
      });
      expect(queueService.addMessageJob).toHaveBeenCalledWith({
        action: 'ephemeral',
        messageData: {
          senderId: mockUser.id,
          receiverId: mockSendEphemeralMessageDto.receiverId,
          content: mockSendEphemeralMessageDto.content,
          propertyId: mockSendEphemeralMessageDto.propertyId,
        },
      });
    });

    it('should send ephemeral message without property successfully', async () => {
      const ephemeralMessageWithoutProperty = TestUtils.createMockSendEphemeralMessageDto();
      delete ephemeralMessageWithoutProperty.propertyId;

      jest.spyOn(pubSubService, 'publishMessage').mockResolvedValue();
      jest.spyOn(queueService, 'addMessageJob').mockResolvedValue({} as Job);

      await service.sendEphemeralMessage(
        mockUser, 
        ephemeralMessageWithoutProperty.receiverId, 
        ephemeralMessageWithoutProperty.content
      );

      expect(pubSubService.publishMessage).toHaveBeenCalledWith('ephemeral_message', {
        type: 'ephemeral_message',
        data: {
          senderId: mockUser.id,
          receiverId: ephemeralMessageWithoutProperty.receiverId,
          content: ephemeralMessageWithoutProperty.content,
          propertyId: undefined,
        },
      });
    });
  });

  describe('getConversation', () => {
    it('should get conversation successfully', async () => {
      const mockConversations = [TestUtils.createMockMessage()];

      jest.spyOn(repository, 'getConversation').mockResolvedValue(mockConversations);

      const result = await service.getConversation(mockUser, mockReceiver);

      expect(result).toEqual(mockConversations);
      expect(repository.getConversation).toHaveBeenCalledWith(mockUser.id, mockReceiver.id);
    });

    it('should get conversation with property successfully', async () => {
      const propertyId = 'property-1';
      const mockConversations = [TestUtils.createMockMessage()];

      jest.spyOn(repository, 'getConversation').mockResolvedValue(mockConversations);

      const result = await service.getConversation(mockUser, mockReceiver, propertyId);

      expect(result).toEqual(mockConversations);
      expect(repository.getConversation).toHaveBeenCalledWith(mockUser.id, mockReceiver.id, propertyId);
    });

    it('should get empty conversation when no messages exist', async () => {
      jest.spyOn(repository, 'getConversation').mockResolvedValue([]);

      const result = await service.getConversation(mockUser, mockReceiver);

      expect(result).toEqual([]);
      expect(repository.getConversation).toHaveBeenCalledWith(mockUser.id, mockReceiver.id);
    });
  });

  describe('getUserConversations', () => {
    it('should get user conversations successfully', async () => {
      const mockConversations = [TestUtils.createMockMessage()];

      jest.spyOn(repository, 'getUserConversations').mockResolvedValue(mockConversations);

      const result = await service.getUserConversations(mockUser);

      expect(result).toEqual(mockConversations);
      expect(repository.getUserConversations).toHaveBeenCalledWith(mockUser.id);
    });

    it('should get empty user conversations when no conversations exist', async () => {
      jest.spyOn(repository, 'getUserConversations').mockResolvedValue([]);

      const result = await service.getUserConversations(mockUser);

      expect(result).toEqual([]);
      expect(repository.getUserConversations).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('error handling', () => {
    it('should handle database error when sending message', async () => {
      const mockSendMessageDto = TestUtils.createMockSendMessageDto();

      jest.spyOn(repository, 'createMessage').mockRejectedValue(new Error('Database error'));

      await expect(service.sendMessage(
        mockUser, 
        mockSendMessageDto.receiverId, 
        mockSendMessageDto.content, 
        mockSendMessageDto.propertyId
      )).rejects.toThrow('Database error');
    });

    it('should handle pubsub error when sending message', async () => {
      const mockSendMessageDto = TestUtils.createMockSendMessageDto();
      const mockMessage = TestUtils.createMockMessage();

      jest.spyOn(repository, 'createMessage').mockResolvedValue(mockMessage);
      jest.spyOn(pubSubService, 'publishMessage').mockRejectedValue(new Error('PubSub error'));

      await expect(service.sendMessage(
        mockUser, 
        mockSendMessageDto.receiverId, 
        mockSendMessageDto.content, 
        mockSendMessageDto.propertyId
      )).rejects.toThrow('PubSub error');
    });

    it('should handle queue error when sending message', async () => {
      const mockSendMessageDto = TestUtils.createMockSendMessageDto();
      const mockMessage = TestUtils.createMockMessage();

      jest.spyOn(repository, 'createMessage').mockResolvedValue(mockMessage);
      jest.spyOn(pubSubService, 'publishMessage').mockResolvedValue();
      jest.spyOn(queueService, 'addMessageJob').mockRejectedValue(new Error('Queue error'));

      await expect(service.sendMessage(
        mockUser, 
        mockSendMessageDto.receiverId, 
        mockSendMessageDto.content, 
        mockSendMessageDto.propertyId
      )).rejects.toThrow('Queue error');
    });
  });
});