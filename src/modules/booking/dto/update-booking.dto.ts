import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookingDto {
  @ApiProperty({ description: 'Check-in date', required: false })
  @IsOptional()
  @IsDateString()
  checkInDate?: string;

  @ApiProperty({ description: 'Check-out date', required: false })
  @IsOptional()
  @IsDateString()
  checkOutDate?: string;

  @ApiProperty({ description: 'Number of guests', required: false })
  @IsOptional()
  @IsNumber()
  numberOfGuests?: number;

  @ApiProperty({ description: 'Special requests', required: false })
  @IsOptional()
  @IsString()
  specialRequests?: string;
} 