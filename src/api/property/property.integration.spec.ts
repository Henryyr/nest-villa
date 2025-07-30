import { Test, TestingModule } from '@nestjs/testing';
import { PropertyService } from './property.service';
import { PropertyRepository } from './property.repository';
import { NotFoundException } from '@nestjs/common';
import { Property } from '@prisma/client';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

describe('PropertyService Integration', () => {
  let service: PropertyService;
  let repository: PropertyRepository;

  const mockOwner = {
    id: 'owner-1',
    name: 'John Owner',
    email: 'owner@example.com',
    role: 'OWNER',
  };

  const mockProperty: Property = {
    id: 'property-1',
    title: 'Beautiful Villa',
    description: 'A beautiful villa with amazing views',
    location: 'Bali, Indonesia',
    price: 1000000,
    type: 'VILLA',
    latitude: 0,
    longitude: 0,
    ownerId: mockOwner.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreatePropertyDto: CreatePropertyDto = {
    title: 'Test Villa',
    description: 'A beautiful test villa',
    location: 'Jakarta, Indonesia',
    price: 1500000,
    type: 'VILLA',
    ownerId: 'owner-1',
  };

  const mockUpdatePropertyDto: UpdatePropertyDto = {
    title: 'Updated Villa',
    price: 2000000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        {
          provide: 'IPropertyRepository',
          useClass: PropertyRepository,
        },
      ],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
    repository = module.get<PropertyRepository>(PropertyRepository);
  });

  describe('createProperty', () => {
    it('should create property successfully', async () => {
      const newProperty = { ...mockProperty, id: 'property-2', ...mockCreatePropertyDto };
      
      jest.spyOn(repository, 'create').mockResolvedValue(newProperty);

      const result = await service.createProperty(mockCreatePropertyDto);

      expect(result.id).toBe(newProperty.id);
      expect(result.title).toBe(mockCreatePropertyDto.title);
      expect(result.description).toBe(mockCreatePropertyDto.description);
      expect(result.location).toBe(mockCreatePropertyDto.location);
      expect(result.price).toBe(mockCreatePropertyDto.price);
      expect(result.type).toBe(mockCreatePropertyDto.type);
      expect(result.ownerId).toBe(mockCreatePropertyDto.ownerId);
      expect(repository.create).toHaveBeenCalledWith({
        ...mockCreatePropertyDto,
      });
    });

    it('should handle repository errors gracefully', async () => {
      jest.spyOn(repository, 'create').mockRejectedValue(new Error('Database error'));

      await expect(service.createProperty(mockCreatePropertyDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return paginated properties', async () => {
      const mockProperties = [mockProperty];
      const mockPaginatedResult = {
        data: mockProperties,
        total: 1,
        page: 1,
        limit: 10,
      };

      jest.spyOn(repository, 'findAll').mockResolvedValue(mockPaginatedResult);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].id).toBe(mockProperty.id);
      expect(result.data[0].title).toBe(mockProperty.title);
      expect(repository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should handle search options correctly', async () => {
      const options = { search: 'villa', page: 1, limit: 10 };
      const mockPaginatedResult = {
        data: [mockProperty],
        total: 1,
        page: 1,
        limit: 10,
      };

      jest.spyOn(repository, 'findAll').mockResolvedValue(mockPaginatedResult);

      const result = await service.findAll(options);

      expect(result.data).toHaveLength(1);
      expect(repository.findAll).toHaveBeenCalledWith(options);
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
    it('should return property by id', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockProperty);

      const result = await service.findById(mockProperty.id);

      expect(result.id).toBe(mockProperty.id);
      expect(result.title).toBe(mockProperty.title);
      expect(result.description).toBe(mockProperty.description);
      expect(result.location).toBe(mockProperty.location);
      expect(result.price).toBe(mockProperty.price);
      expect(result.type).toBe(mockProperty.type);
      expect(result.ownerId).toBe(mockProperty.ownerId);
      expect(repository.findById).toHaveBeenCalledWith(mockProperty.id);
    });

    it('should throw NotFoundException if property not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('updateProperty', () => {
    it('should update property successfully', async () => {
      const updatedProperty = { ...mockProperty, ...mockUpdatePropertyDto };
      
      jest.spyOn(repository, 'findById').mockResolvedValue(mockProperty);
      jest.spyOn(repository, 'update').mockResolvedValue(updatedProperty);

      const result = await service.updateProperty(mockProperty.id, mockUpdatePropertyDto);

      expect(result.id).toBe(mockProperty.id);
      expect(result.title).toBe(mockUpdatePropertyDto.title);
      expect(result.price).toBe(mockUpdatePropertyDto.price);
      expect(result.description).toBe(mockProperty.description); // Unchanged
      expect(result.location).toBe(mockProperty.location); // Unchanged
      expect(repository.findById).toHaveBeenCalledWith(mockProperty.id);
      expect(repository.update).toHaveBeenCalledWith(mockProperty.id, mockUpdatePropertyDto);
    });

    it('should throw NotFoundException if property not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.updateProperty('non-existent', mockUpdatePropertyDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith('non-existent');
    });

    it('should handle repository update errors gracefully', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockProperty);
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Update error'));

      await expect(service.updateProperty(mockProperty.id, mockUpdatePropertyDto)).rejects.toThrow(
        'Update error',
      );
    });
  });

  describe('deleteProperty', () => {
    it('should delete property successfully', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockProperty);
      jest.spyOn(repository, 'delete').mockResolvedValue(mockProperty);

      await service.deleteProperty(mockProperty.id);

      expect(repository.findById).toHaveBeenCalledWith(mockProperty.id);
      expect(repository.delete).toHaveBeenCalledWith(mockProperty.id);
    });

    it('should throw NotFoundException if property not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.deleteProperty('non-existent')).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith('non-existent');
    });

    it('should handle repository delete errors gracefully', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockProperty);
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Delete error'));

      await expect(service.deleteProperty(mockProperty.id)).rejects.toThrow('Delete error');
    });
  });

  describe('findByOwner', () => {
    it('should return properties by owner', async () => {
      const mockProperties = [mockProperty];
      const mockPaginatedResult = {
        data: mockProperties,
        total: 1,
        page: 1,
        limit: 10,
      };

      jest.spyOn(repository, 'findAll').mockResolvedValue(mockPaginatedResult);

      const result = await service.findByOwner(mockOwner.id);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].ownerId).toBe(mockOwner.id);
      expect(repository.findAll).toHaveBeenCalledWith({ ownerId: mockOwner.id });
    });

    it('should handle empty results for owner', async () => {
      const mockPaginatedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      jest.spyOn(repository, 'findAll').mockResolvedValue(mockPaginatedResult);

      const result = await service.findByOwner(mockOwner.id);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('searchProperties', () => {
    it('should search properties with query', async () => {
      const searchQuery = 'villa';
      const mockProperties = [mockProperty];
      const mockPaginatedResult = {
        data: mockProperties,
        total: 1,
        page: 1,
        limit: 10,
      };

      jest.spyOn(repository, 'findAll').mockResolvedValue(mockPaginatedResult);

      const result = await service.searchProperties(searchQuery);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(repository.findAll).toHaveBeenCalledWith({ search: searchQuery });
    });

    it('should handle empty search results', async () => {
      const searchQuery = 'nonexistent';
      const mockPaginatedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      jest.spyOn(repository, 'findAll').mockResolvedValue(mockPaginatedResult);

      const result = await service.searchProperties(searchQuery);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle repository findById errors gracefully', async () => {
      jest.spyOn(repository, 'findById').mockRejectedValue(new Error('Database error'));

      await expect(service.findById(mockProperty.id)).rejects.toThrow('Database error');
    });

    it('should handle repository findAll errors gracefully', async () => {
      jest.spyOn(repository, 'findAll').mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow('Database error');
    });

    it('should handle repository create errors gracefully', async () => {
      jest.spyOn(repository, 'create').mockRejectedValue(new Error('Database error'));

      await expect(service.createProperty(mockCreatePropertyDto)).rejects.toThrow('Database error');
    });
  });
});