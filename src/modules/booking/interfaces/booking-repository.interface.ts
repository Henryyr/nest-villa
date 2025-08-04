import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { BookingResponseDto } from '../dto/booking-response.dto';

export interface IBookingRepository {
  createBooking(createBookingDto: CreateBookingDto, userId: string): Promise<BookingResponseDto>;
  findBookingById(id: string, userId: string): Promise<BookingResponseDto | null>;
  findUserBookings(userId: string): Promise<BookingResponseDto[]>;
  updateBooking(id: string, updateBookingDto: UpdateBookingDto, userId: string): Promise<BookingResponseDto>;
  cancelBooking(id: string, userId: string): Promise<BookingResponseDto>;
  findBookingsByProperty(propertyId: string): Promise<BookingResponseDto[]>;
  checkAvailability(propertyId: string, checkInDate: Date, checkOutDate: Date): Promise<boolean>;
} 