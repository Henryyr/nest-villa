import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';

export enum PropertyType {
  VILLA = 'VILLA',
  HOUSE = 'HOUSE',
  APARTMENT = 'APARTMENT'
}

export class CreatePropertyDto {
  @ApiProperty({ description: 'Property title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Property description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Property location address' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Property price per night' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Property type', enum: PropertyType })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({ description: 'Latitude coordinate from Google Maps', required: false })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({ description: 'Longitude coordinate from Google Maps', required: false })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
} 