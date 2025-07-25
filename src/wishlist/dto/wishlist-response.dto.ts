import { ApiProperty } from '@nestjs/swagger';

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
  images: any[];

  @ApiProperty({ type: Object, description: 'Villa details', required: false })
  villa?: any;
}

export class WishlistResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: () => WishlistPropertyDto })
  property: WishlistPropertyDto;
} 