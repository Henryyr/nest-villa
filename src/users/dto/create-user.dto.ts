import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Nama user' })
  name: string;

  @ApiProperty({ example: 'user@email.com', description: 'Email user' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password user' })
  password: string;

  @ApiProperty({ example: '08123456789', description: 'Nomor telepon user' })
  phone: string;

  @ApiProperty({ required: false, enum: ['ADMIN', 'OWNER', 'CUSTOMER'], description: 'Role user' })
  role?: 'ADMIN' | 'OWNER' | 'CUSTOMER';
} 