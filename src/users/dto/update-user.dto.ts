import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false, example: 'John Doe', description: 'Nama user' })
  name?: string;

  @ApiProperty({ required: false, example: 'user@email.com', description: 'Email user' })
  email?: string;

  @ApiProperty({ required: false, example: 'password123', description: 'Password user' })
  password?: string;

  @ApiProperty({ required: false, example: '08123456789', description: 'Nomor telepon user' })
  phone?: string;

  @ApiProperty({ required: false, enum: ['ADMIN', 'OWNER', 'CUSTOMER'], description: 'Role user' })
  role?: 'ADMIN' | 'OWNER' | 'CUSTOMER';
} 