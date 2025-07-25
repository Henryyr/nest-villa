import { ApiProperty } from '@nestjs/swagger';
import { PropertyImage } from '@prisma/client';
import { VillaDto } from 'src/property/dto/property-response.dto';

export class FavoritePropertyDto {
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

  @ApiProperty({ type: Object, description: 'Villa details', required: false })
  villa?: VillaDto | null;
}

export class FavoriteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: () => FavoritePropertyDto, nullable: true })
  property: FavoritePropertyDto | null;
} 