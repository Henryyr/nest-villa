import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookingService } from './booking.service'; 
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/decorators/role.decorator';
import { UserRole } from '../../modules/auth/dto/register-auth.dto';
import { ValidationPipe, ParseIntPipe, ParseFloatPipe, TrimPipe } from '../../common/pipes';
import { RequestUserDto } from '../../modules/auth/dto/request-user.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('booking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Role(UserRole.CUSTOMER)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Property not available or invalid data' })
  async createBooking(@Body() createBookingDto: CreateBookingDto, @Request() req: { user: RequestUserDto }) {
    return this.bookingService.createBooking(createBookingDto, req.user.id);
  }

  @Get()
  @Role(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get user bookings' })
  @ApiResponse({ status: 200, description: 'User bookings retrieved successfully' })
  async getMyBookings(@Request() req: { user: RequestUserDto }) {
    return this.bookingService.getUserBookings(req.user.id);
  }

  @Get(':id')
  @Role(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBooking(@Param('id') id: string, @Request() req: { user: RequestUserDto }) {
    return this.bookingService.getBookingById(id, req.user.id);
  }

  @Put(':id')
  @Role(UserRole.CUSTOMER)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 400, description: 'Property not available or invalid data' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateBooking(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto, @Request() req: { user: RequestUserDto }) {
    return this.bookingService.updateBooking(id, updateBookingDto, req.user.id);
  }

  @Delete(':id')
  @Role(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Booking already cancelled' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancelBooking(@Param('id') id: string, @Request() req: { user: RequestUserDto }) {
    return this.bookingService.cancelBooking(id, req.user.id);
  }

  @Get('property/:propertyId')
  @Role(UserRole.OWNER)
  @ApiOperation({ summary: 'Get bookings by property (for owners/admins)' })
  @ApiResponse({ status: 200, description: 'Property bookings retrieved successfully' })
  async getBookingsByProperty(@Param('propertyId') propertyId: string) {
    return this.bookingService.getBookingsByProperty(propertyId);
  }

  @Get('availability/:propertyId')
  @ApiOperation({ summary: 'Check property availability' })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  async checkAvailability(
    @Param('propertyId') propertyId: string,
    @Query('checkInDate', new TrimPipe()) checkInDate: string,
    @Query('checkOutDate', new TrimPipe()) checkOutDate: string,
  ) {
    return this.bookingService.checkAvailability(propertyId, new Date(checkInDate), new Date(checkOutDate));
  }
} 