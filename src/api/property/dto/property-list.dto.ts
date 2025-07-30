import { ApiProperty } from '@nestjs/swagger';

export class PropertyListDto {
  @ApiProperty({ example: 'uuid-property', description: 'ID property' })
  id: string;

  @ApiProperty({ example: 'Villa Mewah Bali', description: 'Judul property' })
  title: string;

  @ApiProperty({ example: 'Bali', description: 'Lokasi property' })
  location: string;

  @ApiProperty({ example: 5000000, description: 'Harga property' })
  price: number;

  @ApiProperty({ example: 'VILLA', description: 'Tipe property', enum: ['VILLA', 'HOUSE', 'APARTMENT'] })
  type: string;

  @ApiProperty({ type: [String], description: 'URL gambar property', example: ['https://...'] })
  images: string[];
} 