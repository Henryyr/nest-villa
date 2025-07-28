import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'Hello, I am interested in your property.' })
  content: string;

  @ApiProperty({ example: 'user-uuid', description: 'Receiver user ID' })
  receiverId: string;

  @ApiProperty({ example: 'property-uuid', required: false, description: 'Property ID (optional, if related to a property)' })
  propertyId?: string;
}

export class MessageDto {
  @ApiProperty({ example: 'message-uuid' })
  id: string;

  @ApiProperty({ example: 'user-uuid' })
  senderId: string;

  @ApiProperty({ example: 'user-uuid' })
  receiverId: string;

  @ApiProperty({ example: 'property-uuid', required: false, nullable: true })
  propertyId?: string | null;

  @ApiProperty({ example: 'Hello, I am interested in your property.' })
  content: string;

  @ApiProperty({ example: '2025-07-25T03:21:48.467Z' })
  createdAt: Date;
} 