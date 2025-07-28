import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SendEphemeralMessageDto {
  @ApiProperty({ 
    example: 'user-2', 
    description: 'ID of the user to send ephemeral message to' 
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  receiverId: string;

  @ApiProperty({ 
    example: 'Quick question about the villa!', 
    description: 'Ephemeral message content' 
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ 
    example: 'property-1', 
    description: 'Property ID (optional)',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  propertyId?: string;
} 