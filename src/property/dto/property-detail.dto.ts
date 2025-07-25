import { ApiProperty } from '@nestjs/swagger';
import { VillaDto } from './property-response.dto';

export class PropertyDetailDto {
  @ApiProperty({ example: '85473cc3-6b05-4a19-b9f8-f06182f0edd7', description: 'ID property' })
  id: string;

  @ApiProperty({ example: 'Apartemen Dekat Kampus Yogyakarta', description: 'Judul property' })
  title: string;

  @ApiProperty({ example: 'Apartemen strategis dekat kampus di Yogyakarta', description: 'Deskripsi property' })
  description: string;

  @ApiProperty({ example: 'Yogyakarta', description: 'Lokasi property' })
  location: string;

  @ApiProperty({ example: 1300000, description: 'Harga property' })
  price: number;

  @ApiProperty({ example: 'APARTMENT', description: 'Tipe property', enum: ['VILLA', 'HOUSE', 'APARTMENT'] })
  type: string;

  @ApiProperty({ example: -7.7828, description: 'Latitude property' })
  latitude: number;

  @ApiProperty({ example: 110.3671, description: 'Longitude property' })
  longitude: number;

  @ApiProperty({ type: [String], description: 'URL gambar property', example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'] })
  images: string[];

  @ApiProperty({ example: '2025-07-24T05:46:34.280Z', description: 'Tanggal dibuat' })
  createdAt: Date;

  @ApiProperty({ example: '2025-07-24T05:46:34.280Z', description: 'Tanggal update terakhir' })
  updatedAt: Date;

  @ApiProperty({ type: [String], description: 'Fasilitas property', example: ['Kolam Renang', 'Parkir', 'WiFi'] })
  facilities: string[];

  @ApiProperty({ type: () => VillaDto, required: false, description: 'Detail villa jika property adalah villa', example: { id: 'villa-uuid', bedrooms: 3, bathrooms: 2, hasSwimmingPool: true } })
  villa?: VillaDto | null;

  @ApiProperty({ type: Object, description: 'Info owner property', example: { id: 'owner-uuid', name: 'Budi Santoso', avatarUrl: 'https://example.com/avatar.jpg' } })
  owner: { id: string; name: string; avatarUrl?: string | null };
} 