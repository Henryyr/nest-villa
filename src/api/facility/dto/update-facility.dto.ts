import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateFacilityDto {
  @ApiProperty({ 
    description: 'Facility name',
    example: 'Swimming Pool',
    minLength: 2,
    maxLength: 50,
    required: false
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name?: string;
} 