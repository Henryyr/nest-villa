import { IBaseRepository } from '../../../common/base-repository.interface';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { PropertyResponseDto } from '../dto/property-response.dto';
import { FindAllOptions } from '../../../common/find-all-options';

export interface IPropertyRepository extends IBaseRepository<any, CreatePropertyDto, UpdatePropertyDto, PropertyResponseDto> {
  findByOwnerId(ownerId: string, options?: FindAllOptions): Promise<{ data: any[]; total: number; page: number; limit: number }>;
} 