import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentRepository,
    { provide: 'IPaymentRepository', useClass: PaymentRepository },
  ],
  exports: [PaymentService],
})
export class PaymentModule {} 