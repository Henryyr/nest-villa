import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  CUSTOMER = 'CUSTOMER',
}

export class RegisterAuthDto {
  @ApiProperty({ example: 'John Doe', description: 'Nama user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'user@email.com', description: 'Email user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password user' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '08123456789', description: 'Nomor telepon user' })
  @IsPhoneNumber('ID')
  phone: string;

  @ApiProperty({ required: false, enum: UserRole, description: 'Role user' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
