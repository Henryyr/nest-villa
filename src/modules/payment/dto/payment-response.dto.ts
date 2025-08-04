import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod, PaymentProvider } from '../interfaces/payment.types';

export class PaymentResponseDto {
  @ApiProperty({ description: 'Payment ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Booking ID' })
  bookingId: string;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  method: PaymentMethod;

  @ApiProperty({ description: 'Payment provider', enum: PaymentProvider })
  provider: PaymentProvider;

  @ApiProperty({ description: 'Transaction ID', required: false })
  transactionId?: string;

  @ApiProperty({ description: 'Payment URL', required: false })
  paymentUrl?: string;

  @ApiProperty({ description: 'Expires at', required: false })
  expiresAt?: Date;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;

  @ApiProperty({ description: 'Booking details' })
  booking: {
    id: string;
    propertyId: string;
    checkInDate: Date;
    checkOutDate: Date;
    totalPrice: number;
    property: {
      id: string;
      name: string;
      address: string;
    };
  };
} 