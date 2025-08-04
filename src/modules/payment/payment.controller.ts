import { Controller, Post, Get, Body, Param, UseGuards, Request, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { WebhookDataDto } from './dto/webhook-data.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Role } from '../../common/decorators/role.decorator';
import { UserRole } from '../auth/dto/register-auth.dto';
import { ValidationPipe } from '../../common/pipes';
import { RequestUserDto } from '../../modules/auth/dto/request-user.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment')
  @Role(UserRole.CUSTOMER)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async createPayment(@Body() createPaymentDto: CreatePaymentDto, @Request() req: { user: RequestUserDto }) {
    return this.paymentService.createPayment(createPaymentDto, req.user.id);
  }

  @Get()
  @Role(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get user payments' })
  @ApiResponse({ status: 200, description: 'User payments retrieved successfully' })
  async getUserPayments(@Request() req: { user: RequestUserDto }) {
    return this.paymentService.getUserPayments(req.user.id);
  }

  @Get(':id')
  @Role(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(@Param('id') id: string, @Request() req: { user: RequestUserDto }) {
    return this.paymentService.getPaymentById(id, req.user.id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(@Body() webhookData: WebhookDataDto) {
    return this.paymentService.handleWebhook(webhookData);
  }
} 