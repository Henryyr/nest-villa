import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IBookingRepository } from './interfaces/booking-repository.interface';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { DateUtils } from '../../common/utils/date.utils';
import { BookingResponseDto } from './dto/booking-response.dto';

@Injectable()
export class BookingRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(createBookingDto: CreateBookingDto, userId: string): Promise<BookingResponseDto> {
    const { propertyId, checkInDate, checkOutDate } = createBookingDto;

    // Check availability
    const isAvailable = await this.checkAvailability(propertyId, new Date(checkInDate), new Date(checkOutDate));
    if (!isAvailable) {
      throw new Error('Property is not available for the selected dates');
    }

    // Get property details for pricing
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { price: true }
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Calculate total price
    const days = DateUtils.getDaysBetween(new Date(checkInDate), new Date(checkOutDate));
    const totalPrice = property.price * days;

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        propertyId,
        startDate: new Date(checkInDate),
        endDate: new Date(checkOutDate),
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
          }
        }
      }
    });
  }

  async findBookingById(id: string, userId: string): Promise<BookingResponseDto | null> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
          }
        }
      }
    });
  }

  async findUserBookings(userId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateBooking(id: string, updateBookingDto: UpdateBookingDto, userId: string): Promise<BookingResponseDto> {
    const booking = await this.findBookingById(id, userId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // If dates are being updated, check availability
    if (updateBookingDto.checkInDate || updateBookingDto.checkOutDate) {
      const checkIn = updateBookingDto.checkInDate ? new Date(updateBookingDto.checkInDate) : booking.checkInDate;
      const checkOut = updateBookingDto.checkOutDate ? new Date(updateBookingDto.checkOutDate) : booking.checkOutDate;
      
      const isAvailable = await this.checkAvailability(booking.propertyId, checkIn, checkOut, id);
      if (!isAvailable) {
        throw new Error('Property is not available for the selected dates');
      }
    }

    // Transform DTO to match Prisma schema
    const updateData: any = {};
    if (updateBookingDto.checkInDate) updateData.startDate = new Date(updateBookingDto.checkInDate);
    if (updateBookingDto.checkOutDate) updateData.endDate = new Date(updateBookingDto.checkOutDate);

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
          }
        }
      }
    });
  }

  async cancelBooking(id: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.findBookingById(id, userId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Note: Booking model doesn't have status field in Prisma schema
    // We'll handle cancellation through payment status instead
    const cancelledBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        // status field doesn't exist in Prisma schema
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
          }
        }
      }
    });
  }

  async findBookingsByProperty(propertyId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { propertyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async checkAvailability(propertyId: string, checkInDate: Date, checkOutDate: Date, excludeBookingId?: string) {
    const conflictingBookings = await this.prisma.booking.findMany({
      where: {
        propertyId,
        OR: [
          {
            startDate: {
              lt: checkOutDate,
            },
            endDate: {
              gt: checkInDate,
            },
          },
        ],
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
      },
    });

    return conflictingBookings.length === 0;
  }
} 