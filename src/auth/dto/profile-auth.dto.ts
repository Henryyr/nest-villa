import { ApiProperty } from '@nestjs/swagger';

export class ProfileAuthDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  role: 'ADMIN' | 'OWNER' | 'CUSTOMER';

  @ApiProperty({ required: false, nullable: true })
  avatarUrl?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 