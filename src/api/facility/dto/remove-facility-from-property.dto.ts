import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID } from 'class-validator';

export class RemoveFacilityFromPropertyDto {
  @ApiProperty({ 
    description: 'Array of facility IDs to remove from the property',
    example: ['facility-id-1', 'facility-id-2'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  facilityIds: string[];
} 