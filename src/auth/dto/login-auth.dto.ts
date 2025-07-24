import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({ example: 'user@email.com', description: 'Email user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password user' })
  @IsString()
  password: string;
} 