import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { WebhookDataDto } from '../dto/webhook-data.dto';
import { PaymentStatus } from '../interfaces/payment.types';

export interface IPaymentRepository {
  createPayment(paymentData: CreatePaymentDto, userId: string): Promise<PaymentResponseDto>;
  findPaymentById(id: string, userId: string): Promise<PaymentResponseDto | null>;
  updatePaymentStatus(id: string, status: PaymentStatus): Promise<PaymentResponseDto>;
  findPaymentsByUser(userId: string): Promise<PaymentResponseDto[]>;
  processWebhook(webhookData: WebhookDataDto): Promise<PaymentResponseDto>;
} 