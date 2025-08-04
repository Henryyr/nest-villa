import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './register-auth.dto';

export class RequestUserDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;
} 