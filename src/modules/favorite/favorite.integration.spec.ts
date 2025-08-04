import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteService } from './favorite.service';
import { FavoriteRepository } from './favorite.repository';
import { CacheService } from '../../cache/redis/cache.service';
import { PubSubService } from '../../cache/redis/pubsub.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Favorite, Property } from '@prisma/client';

describe('FavoriteService Integration', () => {
  let service: FavoriteService;
  let repository: FavoriteRepository;
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
    title: 'Beautiful Villa',
    description: 'A beautiful villa with amazing views',
    location: 'Bali, Indonesia',
    price: 1000000,
    type: 'VILLA',
    ownerId: 'owner-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFavorite: Favorite = {
    id: 'favorite-1',
    userId: mockUser.id,
    propertyId: mockProperty.id,
    createdAt: new Date(),
  };

  const mockFavoriteWithProperty = {
    ...mockFavorite,
    property: {
      ...mockProperty,
      images: [],
      villa: null,
    },
  };

  const mockFavoriteWithPropertyNotNull = {
    ...mockFavorite,
    property: {
      ...mockProperty,
      images: [],
      villa: null,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteService,
        {
          provide: 'IFavoriteRepository',
          useClass: FavoriteRepository,
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            invalidateUserFavoritesCache: jest.fn(),
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

    service = module.get<FavoriteService>(FavoriteService);
    repository = module.get<FavoriteRepository>(FavoriteRepository);
    cacheService = module.get<CacheService>(CacheService);
    pubSubService = module.get<PubSubService>(PubSubService);
  });

  describe('addToFavorite', () => {
    it('should add property to favorites successfully', async () => {
      jest.spyOn(repository, 'propertyExists').mockResolvedValue(true);
      jest.spyOn(repository, 'findPropertyById').mockResolvedValue(mockProperty);
      jest.spyOn(repository, 'findByUserAndProperty').mockResolvedValue(null);
      jest.spyOn(repository, 'addToFavorite').mockResolvedValue(mockFavoriteWithProperty);
      jest.spyOn(cacheService, 'invalidateUserFavoritesCache').mockResolvedValue();
      jest.spyOn(pubSubService, 'publishUserNotification').mockResolvedValue();

      const result = await service.addToFavorite(mockUser.id, mockProperty.id);

      expect(result.id).toBe(mockFavorite.id);
      expect(result.userId).toBe(mockUser.id);
      expect(result.property?.id).toBe(mockProperty.id);
      expect(repository.propertyExists).toHaveBeenCalledWith(mockProperty.id);
      expect(repository.findPropertyById).toHaveBeenCalledWith(mockProperty.id);
      expect(repository.findByUserAndProperty).toHaveBeenCalledWith(mockUser.id, mockProperty.id);
      expect(repository.addToFavorite).toHaveBeenCalledWith(mockUser.id, mockProperty.id);
      expect(cacheService.invalidateUserFavoritesCache).toHaveBeenCalledWith(mockUser.id);
      expect(pubSubService.publishUserNotification).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          type: 'favorite_added',
          title: 'Property Added to Favorites',
          message: `Property "${mockProperty.title}" has been added to your favorites`,
        }),
      );
    });

    it('should throw NotFoundException if property does not exist', async () => {
      jest.spyOn(repository, 'propertyExists').mockResolvedValue(false);

      await expect(service.addToFavorite(mockUser.id, 'non-existent-property')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.propertyExists).toHaveBeenCalledWith('non-existent-property');
    });

    it('should throw ConflictException if property already in favorites', async () => {
      jest.spyOn(repository, 'propertyExists').mockResolvedValue(true);
      jest.spyOn(repository, 'findPropertyById').mockResolvedValue(mockProperty);
      jest.spyOn(repository, 'findByUserAndProperty').mockResolvedValue(mockFavorite);

      await expect(service.addToFavorite(mockUser.id, mockProperty.id)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findByUserAndProperty).toHaveBeenCalledWith(mockUser.id, mockProperty.id);
    });
  });

  describe('removeFromFavorite', () => {
    it('should remove property from favorites successfully', async () => {
      jest.spyOn(repository, 'propertyExists').mockResolvedValue(true);
      jest.spyOn(repository, 'findPropertyById').mockResolvedValue(mockProperty);
      jest.spyOn(repository, 'removeFromFavorite').mockResolvedValue({ count: 1 });
      jest.spyOn(cacheService, 'invalidateUserFavoritesCache').mockResolvedValue();
      jest.spyOn(pubSubService, 'publishUserNotification').mockResolvedValue();

      const result = await service.removeFromFavorite(mockUser.id, mockProperty.id);

      expect(result.deleted).toBe(true);
      expect(repository.propertyExists).toHaveBeenCalledWith(mockProperty.id);
      expect(repository.findPropertyById).toHaveBeenCalledWith(mockProperty.id);
      expect(repository.removeFromFavorite).toHaveBeenCalledWith(mockUser.id, mockProperty.id);
      expect(cacheService.invalidateUserFavoritesCache).toHaveBeenCalledWith(mockUser.id);
      expect(pubSubService.publishUserNotification).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          type: 'favorite_removed',
          title: 'Property Removed from Favorites',
          message: `Property "${mockProperty.title}" has been removed from your favorites`,
        }),
      );
    });

    it('should return deleted: false when no favorite was removed', async () => {
      jest.spyOn(repository, 'propertyExists').mockResolvedValue(true);
      jest.spyOn(repository, 'findPropertyById').mockResolvedValue(mockProperty);
      jest.spyOn(repository, 'removeFromFavorite').mockResolvedValue({ count: 0 });

      const result = await service.removeFromFavorite(mockUser.id, mockProperty.id);

      expect(result.deleted).toBe(false);
      expect(cacheService.invalidateUserFavoritesCache).not.toHaveBeenCalled();
      expect(pubSubService.publishUserNotification).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if property does not exist', async () => {
      jest.spyOn(repository, 'propertyExists').mockResolvedValue(false);

      await expect(service.removeFromFavorite(mockUser.id, 'non-existent-property')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getFavorite', () => {
    it('should return favorites from cache if available', async () => {
      const cachedFavorites = [mockFavoriteWithPropertyNotNull];

      jest.spyOn(cacheService, 'get').mockResolvedValue(cachedFavorites);

      const result = await service.getFavorite(mockUser.id);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockFavorite.id);
      expect(result[0].property!.title).toBe(mockProperty.title);
      expect(cacheService.get).toHaveBeenCalledWith(`favorites:${mockUser.id}:{}`);
    });

    it('should fetch from database and cache if not in cache', async () => {
      const mockFavorites = [mockFavoriteWithPropertyNotNull];
      const expectedResult = [
        {
          id: mockFavorite.id,
          userId: mockFavorite.userId,
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
      jest.spyOn(repository, 'getFavorites').mockResolvedValue(mockFavorites);
      jest.spyOn(cacheService, 'set').mockResolvedValue();

      const result = await service.getFavorite(mockUser.id);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockFavorite.id);
      expect(result[0].property!.title).toBe(mockProperty.title);
      expect(repository.getFavorites).toHaveBeenCalledWith(mockUser.id, {});
      expect(cacheService.set).toHaveBeenCalledWith(
        `favorites:${mockUser.id}:{}`,
        expectedResult,
        1800,
      );
    });

    it('should handle search options correctly', async () => {
      const options = { search: 'villa', page: 1, limit: 10 };
      const mockFavorites = [mockFavoriteWithPropertyNotNull];

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'getFavorites').mockResolvedValue(mockFavorites);
      jest.spyOn(cacheService, 'set').mockResolvedValue();

      await service.getFavorite(mockUser.id, options);

      expect(repository.getFavorites).toHaveBeenCalledWith(mockUser.id, options);
      expect(cacheService.set).toHaveBeenCalledWith(
        `favorites:${mockUser.id}:${JSON.stringify(options)}`,
        expect.any(Array),
        1800,
      );
    });

    it('should return empty array when no favorites found', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'getFavorites').mockResolvedValue([]);
      jest.spyOn(cacheService, 'set').mockResolvedValue();

      const result = await service.getFavorite(mockUser.id);

      expect(result).toHaveLength(0);
      expect(cacheService.set).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      jest.spyOn(repository, 'propertyExists').mockRejectedValue(new Error('Database error'));

      await expect(service.addToFavorite(mockUser.id, mockProperty.id)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle cache errors gracefully', async () => {
      jest.spyOn(cacheService, 'get').mockRejectedValue(new Error('Cache error'));

      await expect(service.getFavorite(mockUser.id)).rejects.toThrow('Cache error');
    });

    it('should handle pubsub errors gracefully', async () => {
      jest.spyOn(repository, 'propertyExists').mockResolvedValue(true);
      jest.spyOn(repository, 'findPropertyById').mockResolvedValue(mockProperty);
      jest.spyOn(repository, 'findByUserAndProperty').mockResolvedValue(null);
      jest.spyOn(repository, 'addToFavorite').mockResolvedValue(mockFavoriteWithProperty);
      jest.spyOn(cacheService, 'invalidateUserFavoritesCache').mockResolvedValue();
      jest.spyOn(pubSubService, 'publishUserNotification').mockRejectedValue(
        new Error('PubSub error'),
      );

      await expect(service.addToFavorite(mockUser.id, mockProperty.id)).rejects.toThrow(
        'PubSub error',
      );
    });
  });
});