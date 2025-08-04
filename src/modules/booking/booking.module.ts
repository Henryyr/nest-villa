import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookingController],
  providers: [
    BookingService,
    BookingRepository,
    { provide: 'IBookingRepository', useClass: BookingRepository },
  ],
  exports: [BookingService],
})
export class BookingModule {} 