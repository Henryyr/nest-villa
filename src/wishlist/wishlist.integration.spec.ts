import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { WishlistRepository } from './wishlist.repository';
import { CacheService } from '../redis/cache.service';
import { PubSubService } from '../redis/pubsub.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Wishlist, Property } from '@prisma/client';

describe('WishlistService Integration', () => {
  let service: WishlistService;
  let repository: WishlistRepository;
  let cacheService: CacheService;
  let pubSubService: PubSubService;

  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'CUSTOMER',
  };

  const mockProperty: Property = {
    id: 'property-1',
    title: 'Dream Villa',
    description: 'A dream villa with amazing amenities',
    location: 'Bali, Indonesia',
    price: 2000000,
    type: 'VILLA',
    ownerId: 'owner-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWishlist: Wishlist = {
    id: 'wishlist-1',
    userId: mockUser.id,
    propertyId: mockProperty.id,
    createdAt: new Date(),
  };

  const mockWishlistWithProperty = {
    ...mockWishlist,
    property: {
      ...mockProperty,
      images: [],
      villa: null,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: 'IWishlistRepository',
          useClass: WishlistRepository,
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            invalidateUserWishlistCache: jest.fn(),
          },
        },
        {
          provide: PubSubService,
          useValue: {
            publishUserNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    repository = module.get<WishlistRepository>(WishlistRepository);
    cacheService = module.get<CacheService>(CacheService);
    pubSubService = module.get<PubSubService>(PubSubService);
  });

  describe('addToWishlist', () => {
    it('should add property to wishlist successfully', async () => {
      jest.spyOn(repository, 'propertyExists').mockResolvedValue(true);
      jest.spyOn(repository, 'findPropertyById').mockResolvedValue(mockProperty);
      jest.spyOn(repository, 'findByUserAndProperty').mockResolvedValue(null);
      jest.spyOn(repository, 'addToWishlist').mockResolvedValue(mockWishlistWithProperty);
      jest.spyOn(cacheService, 'invalidateUserWishlistCache').mockResolvedValue();
      jest.spyOn(pubSubService, 'publishUserNotification').mockResolvedValue();

      const result = await service.addToWishlist(mockUser.id, mockProperty.id);

      expect(result.id).toBe(mockWishlist.id);
      expect(result.userId).toBe(mockUser.id);
      expect(result.propertyId).toBe(mockProperty.id);
      expect(repository.propertyExists).toHaveBeenCalledWith(mockProperty.id);
      expect(repository.findPropertyById).toHaveBeenCalledWith(mockProperty.id);
      expect(repository.findByUserAndProperty).toHaveBeenCalledWith(mockUser.id, mockProperty.id);
      expect(repository.addToWishlist).toHaveBeenCalledWith(mockUser.id, mockProperty.id);
      expect(cacheService.invalidateUserWishlistCache).toHaveBeenCalledWith(mockUser.id);
      expect(pubSubService.publishUserNotification).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          type: 'wishlist_added',
          title: 'Property Added to Wishlist',
          message: `Property "${mockProperty.title}" has been added to your wishlist`,
        }),
      );
    });

    it('should throw NotFoundException if property does not exist', async () => {
      jest.spyOn(repository, 'propertyExists').mockResolvedValue(false);

      await expect(service.addToWishlist(mockUser.id, 'non-existent-property')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.propertyExists).toHaveBeenCalledWith('non-existent-property');
    });

    it('should throw ConflictException if property already in wishlist', async () => {
      jest.spyOn(repository, 'propertyExists').mockResolvedValue(true);
      jest.spyOn(repository, 'findPropertyById').mockResolvedValue(mockProperty);
      jest.spyOn(repository, 'findByUserAndProperty').mockResolvedValue(mockWishlist);

      await expect(service.addToWishlist(mockUser.id, mockProperty.id)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findByUserAndProperty).toHaveBeenCalledWith(mockUser.id, mockProperty.id);
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove property from wishlist successfully', async () => {
      jest.spyOn(repository, 'propertyExists').mockResolvedValue(true);
      jest.spyOn(repository, 'findPropertyById').mockResolvedValue(mockProperty);
      jest.spyOn(repository, 'removeFromWishlist').mockResolvedValue({ count: 1 });
      jest.spyOn(cacheService, 'invalidateUserWishlistCache').mockResolvedValue();
      jest.spyOn(pubSubService, 'publishUserNotification').mockResolvedValue();

      const result = await service.removeFromWishlist(mockUser.id, mockProperty.id);

      expect(result.deleted).toBe(true);
      expect(repository.propertyExists).toHaveBeenCalledWith(mockProperty.id);
      expect(repository.findPropertyById).toHaveBeenCalledWith(mockProperty.id);
      expect(repository.removeFromWishlist).toHaveBeenCalledWith(mockUser.id, mockProperty.id);
      expect(cacheService.invalidateUserWishlistCache).toHaveBeenCalledWith(mockUser.id);
      expect(pubSubService.publishUserNotification).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          type: 'wishlist_removed',
          title: 'Property Removed from Wishlist',
          message: `Property "${mockProperty.title}" has been removed from your wishlist`,
        }),
      );
    });

    it('should return deleted: false when no wishlist item was removed', async () => {
      jest.spyOn(repository, 'propertyExists').mockResolvedValue(true);
      jest.spyOn(repository, 'findPropertyById').mockResolvedValue(mockProperty);
      jest.spyOn(repository, 'removeFromWishlist').mockResolvedValue({ count: 0 });

      const result = await service.removeFromWishlist(mockUser.id, mockProperty.id);

      expect(result.deleted).toBe(false);
      expect(cacheService.invalidateUserWishlistCache).not.toHaveBeenCalled();
      expect(pubSubService.publishUserNotification).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if property does not exist', async () => {
      jest.spyOn(repository, 'propertyExists').mockResolvedValue(false);

      await expect(service.removeFromWishlist(mockUser.id, 'non-existent-property')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getWishlist', () => {
    it('should return wishlist from cache if available', async () => {
      const cachedWishlist = [
        {
          id: mockWishlist.id,
          userId: mockWishlist.userId,
          property: {
            id: mockProperty.id,
            title: mockProperty.title,
            location: mockProperty.location,
            price: mockProperty.price,
            images: [],
            villa: null,
          },
        },
      ];

      jest.spyOn(cacheService, 'get').mockResolvedValue(cachedWishlist);

      const result = await service.getWishlist(mockUser.id);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockWishlist.id);
      expect(result[0].property.title).toBe(mockProperty.title);
      expect(cacheService.get).toHaveBeenCalledWith(`wishlist:${mockUser.id}:{}`);
    });

    it('should fetch from database and cache if not in cache', async () => {
      const mockWishlistItems = [mockWishlistWithProperty];
      const expectedResult = [
        {
          id: mockWishlist.id,
          userId: mockWishlist.userId,
          property: {
            id: mockProperty.id,
            title: mockProperty.title,
            location: mockProperty.location,
            price: mockProperty.price,
            images: [],
            villa: null,
          },
        },
      ];

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'getWishlist').mockResolvedValue(mockWishlistItems);
      jest.spyOn(cacheService, 'set').mockResolvedValue();

      const result = await service.getWishlist(mockUser.id);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockWishlist.id);
      expect(result[0].property.title).toBe(mockProperty.title);
      expect(repository.getWishlist).toHaveBeenCalledWith(mockUser.id, {});
      expect(cacheService.set).toHaveBeenCalledWith(
        `wishlist:${mockUser.id}:{}`,
        expectedResult,
        1800,
      );
    });

    it('should handle search options correctly', async () => {
      const options = { search: 'villa', page: 1, limit: 10 };
      const mockWishlistItems = [mockWishlistWithProperty];

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'getWishlist').mockResolvedValue(mockWishlistItems);
      jest.spyOn(cacheService, 'set').mockResolvedValue();

      await service.getWishlist(mockUser.id, options);

      expect(repository.getWishlist).toHaveBeenCalledWith(mockUser.id, options);
      expect(cacheService.set).toHaveBeenCalledWith(
        `wishlist:${mockUser.id}:${JSON.stringify(options)}`,
        expect.any(Array),
        1800,
      );
    });

    it('should return empty array when no wishlist items found', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'getWishlist').mockResolvedValue([]);
      jest.spyOn(cacheService, 'set').mockResolvedValue();

      const result = await service.getWishlist(mockUser.id);

      expect(result).toHaveLength(0);
      expect(cacheService.set).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      jest.spyOn(repository, 'propertyExists').mockRejectedValue(new Error('Database error'));

      await expect(service.addToWishlist(mockUser.id, mockProperty.id)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle cache errors gracefully', async () => {
      jest.spyOn(cacheService, 'get').mockRejectedValue(new Error('Cache error'));

      await expect(service.getWishlist(mockUser.id)).rejects.toThrow('Cache error');
    });

    it('should handle pubsub errors gracefully', async () => {
      jest.spyOn(repository, 'propertyExists').mockResolvedValue(true);
      jest.spyOn(repository, 'findPropertyById').mockResolvedValue(mockProperty);
      jest.spyOn(repository, 'findByUserAndProperty').mockResolvedValue(null);
      jest.spyOn(repository, 'addToWishlist').mockResolvedValue(mockWishlistWithProperty);
      jest.spyOn(cacheService, 'invalidateUserWishlistCache').mockResolvedValue();
      jest.spyOn(pubSubService, 'publishUserNotification').mockRejectedValue(
        new Error('PubSub error'),
      );

      await expect(service.addToWishlist(mockUser.id, mockProperty.id)).rejects.toThrow(
        'PubSub error',
      );
    });
  });
});