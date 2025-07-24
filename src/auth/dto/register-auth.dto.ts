import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsEnum } from 'class-validator';

export enum UserRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  CUSTOMER = 'CUSTOMER',
}

export class RegisterAuthDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsPhoneNumber('ID') // untuk nomor Indonesia, jika tidak bisa pakai IsString
  phone: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
