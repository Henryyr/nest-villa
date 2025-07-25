import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyRepository } from './property.repository';
import { FindAllOptions } from '../../common/types';
import { PropertyResponseDto } from './dto/property-response.dto';

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

  async findById(id: string): Promise<PropertyResponseDto> {
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new NotFoundException('Property not found');
    return this.toPropertyResponseDto(property);
  }

  async createProperty(data: any): Promise<PropertyResponseDto> {
    const property = await this.propertyRepository.createProperty(data);
    return this.toPropertyResponseDto(property);
  }

  async updateProperty(id: string, data: any): Promise<PropertyResponseDto> {
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new NotFoundException('Property not found');
    const updated = await this.propertyRepository.updateProperty(id, data);
    return this.toPropertyResponseDto(updated);
  }

  async deleteProperty(id: string): Promise<PropertyResponseDto> {
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new NotFoundException('Property not found');
    const deleted = await this.propertyRepository.deleteProperty(id);
    return this.toPropertyResponseDto(deleted);
  }

  private toPropertyResponseDto(property: any): PropertyResponseDto {
    return {
      id: property.id,
      title: property.title,
      description: property.description,
      location: property.location,
      price: property.price,
      type: property.type,
      images: property.images,
      villa: property.villa,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }
} 