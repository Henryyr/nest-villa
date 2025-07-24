import { Injectable } from '@nestjs/common';
import { PropertyRepository } from './property.repository';

@Injectable()
export class PropertyService {
  constructor(private propertyRepository: PropertyRepository) {}

  async findAll(params: { type?: string; search?: string; page?: number; limit?: number }) {
    return this.propertyRepository.findAll(params);
  }

  async findOne(id: string) {
    return this.propertyRepository.findOne(id);
  }

  async findVillaDetail(id: string) {
    return this.propertyRepository.findVillaDetail(id);
  }
} 