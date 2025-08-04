import { IBaseRepository } from '../../../common/base-repository.interface';
import { CreateFacilityDto } from '../dto/create-facility.dto';
import { UpdateFacilityDto } from '../dto/update-facility.dto';
import { FacilityResponseDto } from '../dto/facility-response.dto';

export interface IFacilityRepository extends IBaseRepository<any, CreateFacilityDto, UpdateFacilityDto, FacilityResponseDto> {
  findByName(name: string): Promise<any | null>;
  addToProperty(propertyId: string, facilityIds: string[]): Promise<void>;
  removeFromProperty(propertyId: string, facilityIds: string[]): Promise<void>;
  getPropertyFacilities(propertyId: string): Promise<any[]>;
  getAvailableFacilitiesForProperty(propertyId: string): Promise<any[]>;
} 