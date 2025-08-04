import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ description: 'ID user', example: 'uuid-user' })
  id: string;

  @ApiProperty({ description: 'Nama user', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'Email user', example: 'user@email.com' })
  email: string;

  @ApiProperty({ description: 'Nomor telepon user', example: '08123456789' })
  phone: string;

  @ApiProperty({ description: 'Role user', example: 'CUSTOMER', enum: ['ADMIN', 'OWNER', 'CUSTOMER'] })
  role: 'ADMIN' | 'OWNER' | 'CUSTOMER';

  @ApiProperty({ required: false, nullable: true, description: 'URL avatar user', example: 'https://...' })
  avatarUrl?: string | null;

  @ApiProperty({ description: 'Tanggal dibuat', example: '2024-05-01T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Tanggal update terakhir', example: '2024-05-01T12:00:00.000Z' })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Access token for authentication' })
  access_token: string;

  @ApiProperty({ description: 'Refresh token for getting new access token' })
  refresh_token: string;

  @ApiProperty({ description: 'User profile information', type: UserProfileDto })
  user: UserProfileDto;

  @ApiProperty({ description: 'Session ID for tracking', required: false })
  sessionId?: string;
}

export class RegisterResponseDto {
  @ApiProperty({ description: 'User profile information', type: UserProfileDto })
  user: UserProfileDto;
} 