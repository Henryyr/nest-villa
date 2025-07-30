import { Controller, Post, Get, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/send-message.dto';
import { SendEphemeralMessageDto } from './dto/send-ephemeral-message.dto';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a persistent message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin cannot send messages' })
  async sendMessage(
    @Request() req,
    @Body() dto: SendMessageDto,
  ) {
    return await this.messageService.sendMessage(
      req.user,
      dto.receiverId,
      dto.content,
      dto.propertyId,
    );
  }

  @Post('send-ephemeral')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send an ephemeral message' })
  @ApiResponse({ status: 200, description: 'Ephemeral message queued successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin cannot send messages' })
  async sendEphemeralMessage(
    @Request() req,
    @Body() dto: SendEphemeralMessageDto,
  ) {
    return await this.messageService.sendEphemeralMessage(
      req.user,
      dto.receiverId,
      dto.content,
      dto.propertyId,
    );
  }

  @Get('conversation/:otherUserId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get conversation with another user' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin cannot access messages' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(
    @Request() req,
    @Param('otherUserId') otherUserId: string,
    @Body() body: { propertyId?: string },
  ) {
    return await this.messageService.getConversation(
      req.user,
      otherUserId,
      body.propertyId,
    );
  }

  @Get('conversations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all user conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin cannot access messages' })
  async getUserConversations(@Request() req) {
    return await this.messageService.getUserConversations(req.user);
  }
} 