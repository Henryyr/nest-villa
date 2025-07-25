import { ApiProperty } from '@nestjs/swagger';

export class PropertyImageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;
}

export class VillaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bedrooms: number;

  @ApiProperty()
  bathrooms: number;

  @ApiProperty()
  hasSwimmingPool: boolean;
}

export class PropertyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  type: string;

  @ApiProperty({ type: [PropertyImageDto] })
  images: PropertyImageDto[];

  @ApiProperty({ type: VillaDto, required: false })
  villa?: VillaDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 