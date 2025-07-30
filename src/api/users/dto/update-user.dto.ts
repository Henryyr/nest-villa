import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, MaxLength, Matches, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ 
    example: 'John Doe', 
    description: 'Nama user',
    required: false,
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Name must contain only letters and spaces' })
  name?: string;

  @ApiProperty({ 
    example: 'user@email.com', 
    description: 'Email user',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({ 
    example: 'NewPassword123!', 
    description: 'Password user - must be at least 8 characters with uppercase, lowercase, number, and special character',
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    }
  )
  password?: string;

  @ApiProperty({ 
    example: '08123456789', 
    description: 'Nomor telepon user - Indonesian phone number format',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, { 
    message: 'Please provide a valid Indonesian phone number' 
  })
  phone?: string;

  @ApiProperty({ 
    required: false, 
    enum: ['ADMIN', 'OWNER', 'CUSTOMER'], 
    description: 'Role user'
  })
  @IsOptional()
  @IsEnum(['ADMIN', 'OWNER', 'CUSTOMER'], { 
    message: 'Role must be one of: ADMIN, OWNER, CUSTOMER' 
  })
  role?: 'ADMIN' | 'OWNER' | 'CUSTOMER';

  @ApiProperty({ 
    example: 'https://example.com/avatar.jpg', 
    description: 'Avatar URL',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\/.+/, { message: 'Avatar URL must be a valid HTTP/HTTPS URL' })
  avatarUrl?: string;
} 