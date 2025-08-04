import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IPaymentRepository } from './interfaces/payment-repository.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { WebhookDataDto } from './dto/webhook-data.dto';
import { PaymentStatus } from './interfaces/payment.types';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: IPaymentRepository
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto, userId: string): Promise<PaymentResponseDto> {
    try {
      return await this.paymentRepository.createPayment(createPaymentDto, userId);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException('Booking not found');
      }
      throw error;
    }
  }

  async getPaymentById(id: string, userId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findPaymentById(id, userId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async getUserPayments(userId: string): Promise<PaymentResponseDto[]> {
    return await this.paymentRepository.findPaymentsByUser(userId);
  }

  async handleWebhook(webhookData: WebhookDataDto): Promise<PaymentResponseDto> {
    try {
      return await this.paymentRepository.processWebhook(webhookData);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException('Payment not found');
      }
      throw error;
    }
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<PaymentResponseDto> {
    try {
      return await this.paymentRepository.updatePaymentStatus(id, status);
    } catch (error) {
      throw new BadRequestException('Failed to update payment status');
    }
  }
} 