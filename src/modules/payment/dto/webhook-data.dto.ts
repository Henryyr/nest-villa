import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../interfaces/payment.types';

export class WebhookDataDto {
  @ApiProperty({ description: 'Payment ID' })
  paymentId: string;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ description: 'Transaction ID', required: false })
  transactionId?: string;

  @ApiProperty({ description: 'Additional webhook data', required: false })
  additionalData?: Record<string, unknown>;
}