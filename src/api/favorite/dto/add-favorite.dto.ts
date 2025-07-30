import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddFavoriteDto {
  @ApiProperty({ description: 'ID property yang ingin dimasukkan ke favorite', example: 'uuid-property' })
  @IsUUID()
  propertyId: string;
} 