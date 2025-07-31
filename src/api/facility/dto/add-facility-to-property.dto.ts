import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID } from 'class-validator';

export class AddFacilityToPropertyDto {
  @ApiProperty({ 
    description: 'Array of facility IDs to add to the property',
    example: ['facility-id-1', 'facility-id-2'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  facilityIds: string[];
} 