import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyRepository } from './property.repository';
import { FindAllOptions, PropertyWithRelations } from '../../common/types';
import { PropertyResponseDto } from './dto/property-response.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyType, Prisma } from '@prisma/client';
import { PropertyDetailDto } from './dto/property-detail.dto';

@Injectable()
export class PropertyService {
  constructor(private propertyRepository: PropertyRepository) {}

  async findAll(options: FindAllOptions = {}): Promise<{ data: PropertyResponseDto[]; total: number; page: number; limit: number }> {
    const result = await this.propertyRepository.findAll(options);
    return {
      ...result,
      data: result.data.map(this.toPropertyResponseDto),
    };
  }

  async findById(id: string): Promise<PropertyDetailDto> {
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new NotFoundException('Property not found');
    return this.toPropertyDetailDto(property);
  }

  async createProperty(data: CreatePropertyDto): Promise<PropertyResponseDto> {
    const prismaData = {
      title: data.title,
      description: data.description,
      location: data.location,
      price: data.price,
      type: data.type as PropertyType,
      owner: { connect: { id: data.ownerId } },
    };
    const created = await this.propertyRepository.createProperty(prismaData);
    const property = await this.propertyRepository.findById(created.id);
    return this.toPropertyResponseDto(property);
  }

  async updateProperty(id: string, data: UpdatePropertyDto): Promise<PropertyResponseDto> {
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new NotFoundException('Property not found');
    const prismaData: Prisma.PropertyUpdateInput = {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.location && { location: data.location }),
      ...(data.price && { price: data.price }),
      ...(data.type && { type: data.type as PropertyType }),
      ...(data.ownerId && { owner: { connect: { id: data.ownerId } } }),
    };
    await this.propertyRepository.updateProperty(id, prismaData);
    const updated = await this.propertyRepository.findById(id);
    return this.toPropertyResponseDto(updated);
  }

  async deleteProperty(id: string): Promise<PropertyResponseDto> {
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new NotFoundException('Property not found');
    const deleted = await this.propertyRepository.deleteProperty(id);
    return this.toPropertyResponseDto(deleted);
  }

  private toPropertyResponseDto(property: Partial<PropertyWithRelations> | null | undefined): PropertyResponseDto {
    if (!property) throw new NotFoundException('Property not found');
    return {
      id: property.id!,
      title: property.title!,
      description: property.description!,
      location: property.location!,
      price: property.price!,
      type: property.type!,
      images: property.images || [],
      villa: property.villa || undefined,
      createdAt: property.createdAt!,
      updatedAt: property.updatedAt!,
    };
  }

  private toPropertyDetailDto(property: Partial<PropertyWithRelations> & {
    latitude?: number;
    longitude?: number;
    facilities?: { name: string }[];
    owner?: { id: string; name: string; avatarUrl?: string | null };
  }): PropertyDetailDto {
    return {
      id: property.id!,
      title: property.title!,
      description: property.description!,
      location: property.location!,
      price: property.price!,
      type: property.type!,
      latitude: property.latitude ?? 0,
      longitude: property.longitude ?? 0,
      images: property.images ? property.images.map(img => img.url) : [],
      createdAt: property.createdAt!,
      updatedAt: property.updatedAt!,
      facilities: property.facilities ? property.facilities.map(f => f.name) : [],
      villa: property.villa || null,
      owner: property.owner ? {
        id: property.owner.id,
        name: property.owner.name,
        avatarUrl: property.owner.avatarUrl ?? null,
      } : { id: '', name: '', avatarUrl: null },
    };
  }
} 