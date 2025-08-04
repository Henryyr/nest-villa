import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus, PaymentStatus } from '../interfaces/booking.types';

export class BookingResponseDto {
  @ApiProperty({ description: 'Booking ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Property ID' })
  propertyId: string;

  @ApiProperty({ description: 'Check-in date' })
  checkInDate: Date;

  @ApiProperty({ description: 'Check-out date' })
  checkOutDate: Date;

  @ApiProperty({ description: 'Number of guests' })
  numberOfGuests: number;

  @ApiProperty({ description: 'Total price' })
  totalPrice: number;

  @ApiProperty({ description: 'Booking status', enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Special requests', required: false })
  specialRequests?: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;

  @ApiProperty({ description: 'Property details' })
  property: {
    id: string;
    name: string;
    address: string;
    pricePerNight: number;
    images: string[];
  };
} 