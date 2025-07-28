import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyRepository } from './property.repository';
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

@Injectable()
export class PropertyService {
  constructor(private propertyRepository: PropertyRepository) {}

  async findAll(): Promise<PropertyResponseDto[]> {
    const result = await this.propertyRepository.findAll();
    return result.data.map(property => this.toPropertyResponseDto(property));
  }

  async findById(id: string): Promise<PropertyDetailDto> {
    const property = await this.propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return this.toPropertyDetailDto(property);
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

    const property = await this.propertyRepository.createProperty(propertyData);
    const createdProperty = await this.propertyRepository.findById(property.id);
    return this.toPropertyDetailDto(createdProperty!);
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

    await this.propertyRepository.updateProperty(id, propertyData);
    const updatedProperty = await this.propertyRepository.findById(id);
    return this.toPropertyDetailDto(updatedProperty!);
  }

  async deleteProperty(id: string): Promise<void> {
    const existingProperty = await this.propertyRepository.findById(id);
    if (!existingProperty) {
      throw new NotFoundException('Property not found');
    }
    await this.propertyRepository.deleteProperty(id);
  }

  private toPropertyResponseDto(property: PropertyWithImages): PropertyResponseDto {
    return {
      id: property.id,
      title: property.title,
      description: property.description,
      location: property.location,
      price: property.price,
      type: property.type,
      images: property.images?.map(img => ({
        id: img.id,
        url: img.url,
      })) || [],
      villa: property.villa ? {
        id: property.villa.id,
        bedrooms: property.villa.bedrooms,
        bathrooms: property.villa.bathrooms,
        hasSwimmingPool: property.villa.hasSwimmingPool,
      } : undefined,
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
      images: property.images?.map(img => img.url) || [],
      villa: property.villa ? {
        id: property.villa.id,
        bedrooms: property.villa.bedrooms,
        bathrooms: property.villa.bathrooms,
        hasSwimmingPool: property.villa.hasSwimmingPool,
      } : null,
      facilities: property.facilities?.map(facility => facility.name) || [],
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