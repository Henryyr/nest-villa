import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IFacilityRepository } from 'src/shared/interfaces/facility-repository.interface';
import { PropertyService } from '../property/property.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { FacilityResponseDto } from './dto/facility-response.dto';
import { AddFacilityToPropertyDto } from './dto/add-facility-to-property.dto';
import { RemoveFacilityFromPropertyDto } from './dto/remove-facility-from-property.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FacilityService {
  constructor(
    @Inject('IFacilityRepository') private facilityRepository: IFacilityRepository,
    private propertyService: PropertyService,
  ) {}

  async findAll(search?: string, page = 1, limit = 10): Promise<{
    data: FacilityResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.facilityRepository.findAll({
      search,
      page,
      limit,
    });

    return {
      data: result.data.map(facility => this.toFacilityResponseDto(facility)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  async findById(id: string): Promise<FacilityResponseDto> {
    const facility = await this.facilityRepository.findById(id);
    if (!facility) {
      throw new NotFoundException('Facility not found');
    }
    return this.toFacilityResponseDto(facility);
  }

  async create(data: CreateFacilityDto): Promise<FacilityResponseDto> {
    // Check if facility with same name already exists
    const existingFacility = await this.facilityRepository.findByName(data.name);
    if (existingFacility) {
      throw new ConflictException('Facility with this name already exists');
    }

    const facility = await this.facilityRepository.create({
      name: data.name,
    });

    return this.toFacilityResponseDto({
      ...facility,
      propertyCount: 0,
    });
  }

  async update(id: string, data: UpdateFacilityDto): Promise<FacilityResponseDto> {
    const existingFacility = await this.facilityRepository.findById(id);
    if (!existingFacility) {
      throw new NotFoundException('Facility not found');
    }

    // Check if new name conflicts with existing facility
    if (data.name && data.name !== existingFacility.name) {
      const facilityWithSameName = await this.facilityRepository.findByName(data.name);
      if (facilityWithSameName) {
        throw new ConflictException('Facility with this name already exists');
      }
    }

    const updatedFacility = await this.facilityRepository.update(id, {
      name: data.name,
    });

    return this.toFacilityResponseDto(updatedFacility);
  }

  async delete(id: string): Promise<void> {
    const existingFacility = await this.facilityRepository.findById(id);
    if (!existingFacility) {
      throw new NotFoundException('Facility not found');
    }

    await this.facilityRepository.delete(id);
  }

  async addToProperty(propertyId: string, data: AddFacilityToPropertyDto, ownerId: string): Promise<void> {
    // Validate property ownership
    await this.propertyService.validatePropertyOwnership(propertyId, ownerId);

    // Validate that all facilities exist
    for (const facilityId of data.facilityIds) {
      const facility = await this.facilityRepository.findById(facilityId);
      if (!facility) {
        throw new NotFoundException(`Facility with ID ${facilityId} not found`);
      }
    }

    await this.facilityRepository.addToProperty(propertyId, data.facilityIds);
  }

  async removeFromProperty(propertyId: string, data: RemoveFacilityFromPropertyDto, ownerId: string): Promise<void> {
    // Validate property ownership
    await this.propertyService.validatePropertyOwnership(propertyId, ownerId);

    await this.facilityRepository.removeFromProperty(propertyId, data.facilityIds);
  }

  async getPropertyFacilities(propertyId: string): Promise<FacilityResponseDto[]> {
    const facilities = await this.facilityRepository.getPropertyFacilities(propertyId);
    return facilities.map(facility => this.toFacilityResponseDto({
      ...facility,
      propertyCount: 0, // We don't need this for property facilities
    }));
  }

  async getAvailableFacilitiesForProperty(propertyId: string): Promise<FacilityResponseDto[]> {
    const facilities = await this.facilityRepository.getAvailableFacilitiesForProperty(propertyId);
    return facilities.map(facility => this.toFacilityResponseDto({
      ...facility,
      propertyCount: 0, // We don't need this for available facilities
    }));
  }

  private toFacilityResponseDto(facility: any): FacilityResponseDto {
    return {
      id: facility.id,
      name: facility.name,
      propertyCount: facility.propertyCount || 0,
      createdAt: facility.createdAt,
      updatedAt: facility.updatedAt,
    };
  }
} 