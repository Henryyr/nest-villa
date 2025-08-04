import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddWishlistDto {
  @ApiProperty({ description: 'ID property yang ingin dimasukkan ke wishlist', example: 'uuid-property' })
  @IsUUID()
  propertyId: string;
} 