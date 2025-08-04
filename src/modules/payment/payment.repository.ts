import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IPaymentRepository } from './interfaces/payment-repository.interface';
import { PaymentStatus, PaymentMethod, PaymentProvider } from './interfaces/payment.types';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(paymentData: CreatePaymentDto, userId: string) {
    const { bookingId, method, amount } = paymentData;

    // Verify booking exists and belongs to user
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
          }
        }
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    return this.prisma.payment.create({
      data: {
        bookingId,
        amount,
        status: PaymentStatus.PENDING,
        method,
      },
      include: {
        booking: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                location: true,
              }
            }
          }
        }
      }
    });
  }

  async findPaymentById(id: string, userId: string) {
    return this.prisma.payment.findFirst({
      where: {
        id,
        booking: {
          userId,
        },
      },
      include: {
        booking: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                location: true,
              }
            }
          }
        }
      }
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus) {
    return this.prisma.payment.update({
      where: { id },
      data: { 
        status: status as any,
        paidAt: status === PaymentStatus.PAID ? new Date() : null,
      },
      include: {
        booking: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                location: true,
              }
            }
          }
        }
      }
    });
  }

  async findPaymentsByUser(userId: string) {
    return this.prisma.payment.findMany({
      where: {
        booking: {
          userId,
        },
      },
      include: {
        booking: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                location: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async processWebhook(webhookData: any) {
    // Implementation for processing payment webhooks
    // This would handle different payment provider webhooks
    const { paymentId, status } = webhookData;

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Update payment status
    const updatedPayment = await this.updatePaymentStatus(paymentId, status);

    // Note: Booking model doesn't have status field in Prisma schema
    // Payment status is handled through the Payment model

    return updatedPayment;
  }
} 