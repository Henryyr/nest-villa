import { Injectable, NotFoundException } from '@nestjs/common';
import { IPropertyRepository } from '../../common/interfaces/property-repository.interface';
import { Inject } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyResponseDto } from './dto/property-response.dto';
import { PropertyDetailDto } from './dto/property-detail.dto';
import { Prisma, PropertyType } from '@prisma/client';

interface PropertyWithImages {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  type: PropertyType;
  images: Array<{ id: string; url: string }>;
  villa?: { id: string; bedrooms: number; bathrooms: number; hasSwimmingPool: boolean } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PropertyWithDetails extends PropertyWithImages {
  facilities: Array<{ id: string; name: string }>;
  owner: { id: string; name: string; avatarUrl: string | null };
}

function withPropertyDefaults<T extends Partial<PropertyWithDetails>>(property: T): PropertyWithDetails {
  return {
    ...property,
    images: Array.isArray(property.images) ? property.images : [],
    facilities: Array.isArray(property.facilities) ? property.facilities : [],
    owner: property.owner ?? { id: '', name: '', avatarUrl: null },
    title: property.title ?? '',
    description: property.description ?? '',
    location: property.location ?? '',
    price: property.price ?? 0,
    type: property.type ?? PropertyType.HOUSE,
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
    const result = await this.propertyRepository.findAll();
    return result.data.map(property => this.toPropertyResponseDto(withPropertyDefaults(property)));
  }

  async findById(id: string): Promise<PropertyDetailDto> {
    const property = await this.propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return this.toPropertyDetailDto(withPropertyDefaults(property));
  }

  async createProperty(data: CreatePropertyDto): Promise<PropertyDetailDto> {
    const propertyData: Prisma.PropertyCreateInput = {
      title: data.title,
      description: data.description,
      location: data.location,
      price: data.price,
      type: data.type as PropertyType,
      owner: { connect: { id: data.ownerId } },
    };

    const property = await this.propertyRepository.create(propertyData);
    const createdProperty = await this.propertyRepository.findById(property.id);
    return this.toPropertyDetailDto(withPropertyDefaults(createdProperty!));
  }

  async updateProperty(id: string, data: UpdatePropertyDto): Promise<PropertyDetailDto> {
    const existingProperty = await this.propertyRepository.findById(id);
    if (!existingProperty) {
      throw new NotFoundException('Property not found');
    }

    const propertyData: Prisma.PropertyUpdateInput = {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.location && { location: data.location }),
      ...(data.price && { price: data.price }),
      ...(data.type && { type: data.type as PropertyType }),
    };

    await this.propertyRepository.update(id, propertyData);
    const updatedProperty = await this.propertyRepository.findById(id);
    return this.toPropertyDetailDto(withPropertyDefaults(updatedProperty!));
  }

  async deleteProperty(id: string): Promise<void> {
    const existingProperty = await this.propertyRepository.findById(id);
    if (!existingProperty) {
      throw new NotFoundException('Property not found');
    }
    await this.propertyRepository.delete(id);
  }

  private toPropertyResponseDto(property: PropertyWithImages): PropertyResponseDto {
    return {
      id: property.id,
      title: property.title,
      description: property.description,
      location: property.location,
      price: property.price,
      type: property.type,
      images: Array.isArray(property.images)
        ? property.images.map(img => ({ id: img.id, url: img.url }))
        : [],
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
    return {
      id: property.id,
      title: property.title,
      description: property.description,
      location: property.location,
      price: property.price,
      type: property.type,
      latitude: 0, // Default value since it's not in the schema
      longitude: 0, // Default value since it's not in the schema
      images: Array.isArray(property.images)
        ? property.images.map(img => img.url)
        : [],
      villa: property.villa
        ? {
            id: property.villa.id,
            bedrooms: property.villa.bedrooms,
            bathrooms: property.villa.bathrooms,
            hasSwimmingPool: property.villa.hasSwimmingPool,
          }
        : null,
      facilities: Array.isArray(property.facilities)
        ? property.facilities.map(facility => facility.name)
        : [],
      owner: property.owner
        ? {
            id: property.owner.id,
            name: property.owner.name,
            avatarUrl: property.owner.avatarUrl,
          }
        : { id: '', name: '', avatarUrl: null },
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }
} 