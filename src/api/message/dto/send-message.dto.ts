import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ 
    example: 'user-2', 
    description: 'ID of the user to send message to' 
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  receiverId: string;

  @ApiProperty({ 
    example: 'Hello! How are you?', 
    description: 'Message content' 
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