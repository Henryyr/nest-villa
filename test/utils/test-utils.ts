import { User, Property, Message, Favorite, Wishlist } from '@prisma/client';
import { CreateUserDto } from 'src/api/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/api/users/dto/update-user.dto';
import { CreatePropertyDto } from 'src/api/property/dto/create-property.dto';
import { UpdatePropertyDto } from 'src/api/property/dto/update-property.dto';
import { SendMessageDto } from 'src/api/message/dto/send-message.dto';
import { SendEphemeralMessageDto } from 'src/api/message/dto/send-ephemeral-message.dto';

export class TestUtils {
  // Mock Users
  static createMockUser(overrides: Partial<User> = {}): User {
    return {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword123',
      phone: '+6281234567890',
      role: 'CUSTOMER',
      avatarUrl: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createMockOwner(overrides: Partial<User> = {}): User {
    return this.createMockUser({
      id: 'owner-1',
      name: 'Jane Owner',
      email: 'owner@example.com',
      role: 'OWNER',
      ...overrides,
    });
  }

  static createMockCreateUserDto(overrides: Partial<CreateUserDto> = {}): CreateUserDto {
    return {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'Password123!',
      phone: '+6281234567891',
      role: 'CUSTOMER',
      ...overrides,
    };
  }

  static createMockUpdateUserDto(overrides: Partial<UpdateUserDto> = {}): UpdateUserDto {
    return {
      name: 'Updated User',
      phone: '+6281234567892',
      ...overrides,
    };
  }

  // Mock Properties
  static createMockProperty(overrides: Partial<Property> = {}): Property {
    return {
      id: 'property-1',
      title: 'Beautiful Villa',
      description: 'A beautiful villa with amazing views',
      location: 'Bali, Indonesia',
      price: 1000000,
      type: 'VILLA',
      latitude: 0,
      longitude: 0,
      ownerId: 'owner-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createMockCreatePropertyDto(overrides: Partial<CreatePropertyDto> = {}): CreatePropertyDto {
    return {
      title: 'New Villa',
      description: 'A new villa for testing',
      location: 'Jakarta, Indonesia',
      price: 1500000,
      type: 'VILLA',
      ownerId: 'owner-1',
      ...overrides,
    };
  }

  static createMockUpdatePropertyDto(overrides: Partial<UpdatePropertyDto> = {}): UpdatePropertyDto {
    return {
      title: 'Updated Villa',
      price: 2000000,
      ...overrides,
    };
  }

  // Mock Messages
  static createMockMessage(overrides: Partial<Message> = {}): Message {
    return {
      id: 'message-1',
      senderId: 'user-1',
      receiverId: 'user-2',
      content: 'Hello, this is a test message',
      propertyId: 'property-1',
      createdAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createMockSendMessageDto(overrides: Partial<SendMessageDto> = {}): SendMessageDto {
    return {
      receiverId: 'user-2',
      content: 'Hello, this is a test message',
      propertyId: 'property-1',
      ...overrides,
    };
  }

  static createMockSendEphemeralMessageDto(overrides: Partial<SendEphemeralMessageDto> = {}): SendEphemeralMessageDto {
    return {
      receiverId: 'user-2',
      content: 'This is an ephemeral message',
      propertyId: 'property-1',
      ...overrides,
    };
  }

  // Mock Favorites
  static createMockFavorite(overrides: Partial<Favorite> = {}): Favorite {
    return {
      id: 'favorite-1',
      userId: 'user-1',
      propertyId: 'property-1',
      createdAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createMockFavoriteWithProperty(overrides: Partial<Favorite & { property: Property }> = {}): Favorite & { property: Property } {
    return {
      id: 'favorite-1',
      userId: 'user-1',
      propertyId: 'property-1',
      createdAt: new Date('2024-01-01'),
      property: this.createMockProperty(),
      ...overrides,
    };
  }

  // Mock Wishlists
  static createMockWishlist(overrides: Partial<Wishlist> = {}): Wishlist {
    return {
      id: 'wishlist-1',
      userId: 'user-1',
      propertyId: 'property-1',
      createdAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createMockWishlistWithProperty(overrides: Partial<Wishlist & { property: Property }> = {}): Wishlist & { property: Property } {
    return {
      id: 'wishlist-1',
      userId: 'user-1',
      propertyId: 'property-1',
      createdAt: new Date('2024-01-01'),
      property: this.createMockProperty(),
      ...overrides,
    };
  }

  // Mock Paginated Results
  static createMockPaginatedResult<T>(data: T[], overrides: Partial<{ total: number; page: number; limit: number }> = {}) {
    return {
      data,
      total: data.length,
      page: 1,
      limit: 10,
      ...overrides,
    };
  }

  // Mock Cache Data
  static createMockCachedUser(overrides: Partial<{ id: string; name: string; email: string; phone: string; role: string; avatarUrl: string | null; createdAt: Date; updatedAt: Date }> = {}) {
    return {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+6281234567890',
      role: 'CUSTOMER',
      avatarUrl: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createMockCachedProperty(overrides: Partial<{ id: string; title: string; description: string; location: string; price: number; type: string; images: string[]; villa: unknown; createdAt: Date; updatedAt: Date; ownerId: string }> = {}) {
    return {
      id: 'property-1',
      title: 'Beautiful Villa',
      description: 'A beautiful villa with amazing views',
      location: 'Bali, Indonesia',
      price: 1000000,
      type: 'VILLA',
      images: [],
      villa: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ownerId: 'owner-1',
      ...overrides,
    };
  }

  // Mock Error Responses
  static createMockErrorResponse(message: string, code: string = 'ERROR', details?: Record<string, unknown>) {
    return {
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  // Mock JWT Payload
  static createMockJwtPayload(overrides: Partial<{ sub: string; email: string; role: string; iat?: number; exp?: number }> = {}) {
    return {
      sub: 'user-1',
      email: 'john@example.com',
      role: 'CUSTOMER',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...overrides,
    };
  }

  // Mock Request Object
  static createMockRequest(overrides: Partial<{ user: unknown; ip: string; method: string; url: string; headers: Record<string, string> }> = {}) {
    return {
      user: this.createMockUser(),
      ip: '127.0.0.1',
      method: 'GET',
      url: '/api/users',
      headers: {
        'user-agent': 'Mozilla/5.0 (Test Browser)',
        'authorization': 'Bearer test-token',
      },
      ...overrides,
    };
  }

  // Mock Response Object
  static createMockResponse() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  }

  // Mock Queue Job
  static createMockQueueJob<T = unknown>(data: T, overrides: Partial<{ id: string; name: string; timestamp: number }> = {}) {
    return {
      id: 'job-1',
      name: 'test-job',
      data,
      timestamp: Date.now(),
      ...overrides,
    };
  }

  // Mock PubSub Message
  static createMockPubSubMessage<T = unknown>(type: string, data: T, overrides: Partial<{ timestamp: number; source: string }> = {}) {
    return {
      type,
      data,
      timestamp: Date.now(),
      source: 'test-service',
      ...overrides,
    };
  }

  // Helper to create multiple mock items
  static createMultipleMockItems<T>(
    createItem: (index: number) => T,
    count: number
  ): T[] {
    return Array.from({ length: count }, (_, index) => createItem(index));
  }

  // Helper to create mock repository methods
  static createMockRepositoryMethods() {
    return {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };
  }

  // Helper to create mock service methods
  static createMockServiceMethods() {
    return {
      // Generic service methods
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  }

  // Helper to create mock cache methods
  static createMockCacheMethods() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      invalidateUserCache: jest.fn(),
      invalidateUserFavoritesCache: jest.fn(),
      invalidateUserWishlistCache: jest.fn(),
      cacheUser: jest.fn(),
      cacheProperty: jest.fn(),
      getCachedUser: jest.fn(),
      getCachedProperty: jest.fn(),
    };
  }

  // Helper to create mock queue methods
  static createMockQueueMethods() {
    return {
      addUserWelcomeJob: jest.fn(),
      addUserProfileUpdateJob: jest.fn(),
      addUserJob: jest.fn(),
      addMessageJob: jest.fn(),
      addFileJob: jest.fn(),
      getQueueByName: jest.fn(),
      getAllQueueStats: jest.fn(),
    };
  }

  // Helper to create mock pubsub methods
  static createMockPubSubMethods() {
    return {
      publishMessage: jest.fn(),
      publishUserNotification: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
  }
}