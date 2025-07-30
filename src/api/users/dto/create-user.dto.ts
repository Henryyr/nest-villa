import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Matches, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ 
    example: 'John Doe', 
    description: 'Nama user',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Name must contain only letters and spaces' })
  name: string;

  @ApiProperty({ 
    example: 'user@email.com', 
    description: 'Email user'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'Password123!', 
    description: 'Password user - must be at least 8 characters with uppercase, lowercase, number, and special character'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    }
  )
  password: string;

  @ApiProperty({ 
    example: '08123456789', 
    description: 'Nomor telepon user - Indonesian phone number format'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, { 
    message: 'Please provide a valid Indonesian phone number' 
  })
  phone: string;

  @ApiProperty({ 
    required: false, 
    enum: ['ADMIN', 'OWNER', 'CUSTOMER'], 
    description: 'Role user',
    default: 'CUSTOMER'
  })
  @IsOptional()
  @IsEnum(['ADMIN', 'OWNER', 'CUSTOMER'], { 
    message: 'Role must be one of: ADMIN, OWNER, CUSTOMER' 
  })
  role?: 'ADMIN' | 'OWNER' | 'CUSTOMER';
} 