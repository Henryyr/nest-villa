import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IBookingRepository } from './interfaces/booking-repository.interface';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { BookingStatus } from './interfaces/booking.types';

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: IBookingRepository
  ) {}

  async createBooking(createBookingDto: CreateBookingDto, userId: string): Promise<BookingResponseDto> {
    try {
      return await this.bookingRepository.createBooking(createBookingDto, userId);
    } catch (error) {
      if (error.message.includes('not available')) {
        throw new BadRequestException('Property is not available for the selected dates');
      }
      if (error.message.includes('not found')) {
        throw new NotFoundException('Property not found');
      }
      throw error;
    }
  }

  async getUserBookings(userId: string): Promise<BookingResponseDto[]> {
    return await this.bookingRepository.findUserBookings(userId);
  }

  async getBookingById(id: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findBookingById(id, userId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async updateBooking(id: string, updateBookingDto: UpdateBookingDto, userId: string): Promise<BookingResponseDto> {
    try {
      return await this.bookingRepository.updateBooking(id, updateBookingDto, userId);
    } catch (error) {
      if (error.message.includes('not available')) {
        throw new BadRequestException('Property is not available for the selected dates');
      }
      if (error.message.includes('not found')) {
        throw new NotFoundException('Booking not found');
      }
      throw error;
    }
  }

  async cancelBooking(id: string, userId: string): Promise<BookingResponseDto> {
    try {
      return await this.bookingRepository.cancelBooking(id, userId);
    } catch (error) {
      if (error.message.includes('already cancelled')) {
        throw new BadRequestException('Booking is already cancelled');
      }
      if (error.message.includes('not found')) {
        throw new NotFoundException('Booking not found');
      }
      throw error;
    }
  }

  async getBookingsByProperty(propertyId: string): Promise<BookingResponseDto[]> {
    return await this.bookingRepository.findBookingsByProperty(propertyId);
  }

  async checkAvailability(propertyId: string, checkInDate: Date, checkOutDate: Date): Promise<boolean> {
    return await this.bookingRepository.checkAvailability(propertyId, checkInDate, checkOutDate);
  }
} 