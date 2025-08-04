import { ApiProperty } from '@nestjs/swagger';

export class FacilityResponseDto {
  @ApiProperty({ description: 'Facility ID' })
  id: string;

  @ApiProperty({ description: 'Facility name' })
  name: string;

  @ApiProperty({ description: 'Number of properties using this facility' })
  propertyCount: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
} 