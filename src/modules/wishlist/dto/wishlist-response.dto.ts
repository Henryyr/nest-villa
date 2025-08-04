import { ApiProperty } from '@nestjs/swagger';
import { PropertyImage } from '@prisma/client';

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

export class WishlistPropertyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ type: [Object], description: 'Property images' })
  images: PropertyImage[];

  @ApiProperty({ type: VillaDto, required: false, nullable: true, description: 'Villa details' })
  villa?: VillaDto | null;
}

export class WishlistResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: () => WishlistPropertyDto, nullable: true })
  property: WishlistPropertyDto | null;
} 