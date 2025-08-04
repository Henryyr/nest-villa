import { Injectable, ForbiddenException } from '@nestjs/common';
import { IPropertyRepository } from './interfaces/property-repository.interface';
import { Inject } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyResponseDto } from './dto/property-response.dto';
import { PropertyDetailDto } from './dto/property-detail.dto';
import { Prisma, PropertyType } from '@prisma/client';
import { PropertyNotFoundException, DatabaseOperationException } from '../../common/error.types';

interface PropertyImage {
  id: string;
  url: string;
}

interface PropertyFile {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

interface PropertyFacility {
  id: string;
  name: string;
}

interface PropertyOwner {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface PropertyVilla {
  id: string;
  bedrooms: number;
  bathrooms: number;
  hasSwimmingPool: boolean;
}

interface PropertyWithImages {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  type: PropertyType;
  latitude?: number | null;
  longitude?: number | null;
  images: PropertyImage[];
  files?: PropertyFile[];
  villa?: PropertyVilla | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PropertyWithDetails extends PropertyWithImages {
  facilities: PropertyFacility[];
  owner: PropertyOwner;
}

function withPropertyDefaults<T extends Partial<PropertyWithDetails>>(property: T): PropertyWithDetails {
  return {
    ...property,
    images: Array.isArray(property.images) ? property.images : [],
    files: Array.isArray(property.files) ? property.files : [],
    facilities: Array.isArray(property.facilities) ? property.facilities : [],
    owner: property.owner ?? { id: '', name: '', avatarUrl: null },
    title: property.title ?? '',
    description: property.description ?? '',
    location: property.location ?? '',
    price: property.price ?? 0,
    type: property.type ?? PropertyType.HOUSE,
    latitude: property.latitude ?? 0,
    longitude: property.longitude ?? 0,
    id: property.id ?? '',
    createdAt: property.createdAt ?? new Date(),
    updatedAt: property.updatedAt ?? new Date(),
  } as PropertyWithDetails;
}

@Injectable()
export class PropertyService {
  constructor(
    @Inject('IPropertyRepository') private propertyRepository: IPropertyRepository,
  ) {}

  async findAll(): Promise<PropertyResponseDto[]> {
    try {
      const result = await this.propertyRepository.findAll();
      return result.data.map(property => this.toPropertyResponseDto(withPropertyDefaults(property)));
    } catch {
      throw new DatabaseOperationException('Failed to retrieve properties');
    }
  }

  async findByOwnerId(ownerId: string): Promise<PropertyResponseDto[]> {
    try {
      const result = await this.propertyRepository.findByOwnerId(ownerId);
      return result.data.map(property => this.toPropertyResponseDto(withPropertyDefaults(property)));
    } catch {
      throw new DatabaseOperationException('Failed to retrieve owner properties');
    }
  }

  async findById(id: string): Promise<PropertyDetailDto> {
    try {
      const property = await this.propertyRepository.findById(id);
      if (!property) {
        throw new PropertyNotFoundException();
      }
      return this.toPropertyDetailDto(withPropertyDefaults(property));
    } catch (error) {
      if (error instanceof PropertyNotFoundException) {
        throw error;
      }
      throw new DatabaseOperationException('Failed to retrieve property details');
    }
  }

  async createProperty(data: CreatePropertyDto, ownerId: string): Promise<PropertyDetailDto> {
    try {
      const propertyData: Prisma.PropertyCreateInput = {
        title: data.title,
        description: data.description,
        location: data.location,
        price: data.price,
        type: data.type as PropertyType,
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0,
        owner: { connect: { id: ownerId } },
      };

      const property = await this.propertyRepository.create(propertyData);
      const createdProperty = await this.propertyRepository.findById(property.id);
      if (!createdProperty) {
        throw new DatabaseOperationException('Failed to create property');
      }
      return this.toPropertyDetailDto(withPropertyDefaults(createdProperty));
    } catch (error) {
      if (error instanceof DatabaseOperationException) {
        throw error;
      }
      throw new DatabaseOperationException('Failed to create property');
    }
  }

  async updateProperty(id: string, data: UpdatePropertyDto, ownerId: string): Promise<PropertyDetailDto> {
    try {
      const existingProperty = await this.propertyRepository.findById(id);
      if (!existingProperty) {
        throw new PropertyNotFoundException();
      }

      // Check if the property belongs to the authenticated owner
      if (existingProperty.ownerId !== ownerId) {
        throw new ForbiddenException('You can only update your own properties');
      }

      const propertyData: Prisma.PropertyUpdateInput = {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.location && { location: data.location }),
        ...(data.price && { price: data.price }),
        ...(data.type && { type: data.type as PropertyType }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
      };

      await this.propertyRepository.update(id, propertyData);
      const updatedProperty = await this.propertyRepository.findById(id);
      if (!updatedProperty) {
        throw new DatabaseOperationException('Failed to update property');
      }
      return this.toPropertyDetailDto(withPropertyDefaults(updatedProperty));
    } catch (error) {
      if (error instanceof PropertyNotFoundException || 
          error instanceof DatabaseOperationException ||
          error instanceof ForbiddenException) {
        throw error;
      }
      throw new DatabaseOperationException('Failed to update property');
    }
  }

  async deleteProperty(id: string, ownerId: string): Promise<void> {
    try {
      const existingProperty = await this.propertyRepository.findById(id);
      if (!existingProperty) {
        throw new PropertyNotFoundException();
      }

      // Check if the property belongs to the authenticated owner
      if (existingProperty.ownerId !== ownerId) {
        throw new ForbiddenException('You can only delete your own properties');
      }

      await this.propertyRepository.delete(id);
    } catch (error) {
      if (error instanceof PropertyNotFoundException || 
          error instanceof ForbiddenException) {
        throw error;
      }
      throw new DatabaseOperationException('Failed to delete property');
    }
  }

  async validatePropertyOwnership(propertyId: string, ownerId: string): Promise<void> {
    try {
      const property = await this.propertyRepository.findById(propertyId);
      if (!property) {
        throw new PropertyNotFoundException();
      }

      if (property.ownerId !== ownerId) {
        throw new ForbiddenException('You can only manage facilities for your own properties');
      }
    } catch (error) {
      if (error instanceof PropertyNotFoundException || 
          error instanceof ForbiddenException) {
        throw error;
      }
      throw new DatabaseOperationException('Failed to validate property ownership');
    }
  }

  private toPropertyResponseDto(property: PropertyWithImages): PropertyResponseDto {
    // Combine images from PropertyImage and File tables
    const propertyImages = property.images.map(img => ({ id: img.id, url: img.url }));
    const fileImages = (property.files || []).map(file => ({ id: file.id, url: file.url }));
    const allImages = [...propertyImages, ...fileImages];

    return {
      id: property.id,
      title: property.title,
      description: property.description,
      location: property.location,
      price: property.price,
      type: property.type,
      images: allImages,
      villa: property.villa
        ? {
            id: property.villa.id,
            bedrooms: property.villa.bedrooms,
            bathrooms: property.villa.bathrooms,
            hasSwimmingPool: property.villa.hasSwimmingPool,
          }
        : undefined,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }

  private toPropertyDetailDto(property: PropertyWithDetails): PropertyDetailDto {
    // Combine images from PropertyImage and File tables
    const propertyImageUrls = property.images.map(img => img.url);
    const fileImageUrls = (property.files || []).map(file => file.url);
    const allImageUrls = [...propertyImageUrls, ...fileImageUrls];

    return {
      id: property.id,
      title: property.title,
      description: property.description,
      location: property.location,
      price: property.price,
      type: property.type,
      latitude: property.latitude ?? 0,
      longitude: property.longitude ?? 0,
      images: allImageUrls,
      villa: property.villa
        ? {
            id: property.villa.id,
            bedrooms: property.villa.bedrooms,
            bathrooms: property.villa.bathrooms,
            hasSwimmingPool: property.villa.hasSwimmingPool,
          }
        : null,
      facilities: property.facilities.map(facility => facility.name),
      owner: {
        id: property.owner.id,
        name: property.owner.name,
        avatarUrl: property.owner.avatarUrl,
      },
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }
} 