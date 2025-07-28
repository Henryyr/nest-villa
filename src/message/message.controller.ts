import { Controller, Post, Get, Body, Param, Query, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'common/guards/jwt-auth.guard';
import { Request } from 'express';
import { MessageService } from './message.service';
import { JwtPayload } from 'common/types';
import { SendMessageDto, MessageDto } from './dto/message.dto';
import { User } from '@prisma/client';

@ApiTags('message')
@Controller('message')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Send a private message (Owner/Customer only)' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(@Req() req: Request & { user: JwtPayload }, @Body() dto: SendMessageDto) {
    if (req.user.role === 'ADMIN') throw new ForbiddenException('Admins cannot send messages');
    return this.messageService.sendMessage(req.user as unknown as User, dto.receiverId, dto.content, dto.propertyId);
  }

  @Post('ephemeral')
  @ApiOperation({ summary: 'Send an ephemeral private message (Owner/Customer only, not stored in DB)' })
  @ApiResponse({ status: 201, description: 'Ephemeral message queued' })
  async sendEphemeralMessage(@Req() req: Request & { user: JwtPayload }, @Body() dto: SendMessageDto) {
    if (req.user.role === 'ADMIN') throw new ForbiddenException('Admins cannot send messages');
    return this.messageService.sendEphemeralMessage(req.user as unknown as User, dto.receiverId, dto.content, dto.propertyId);
  }

  @Get('conversation/:otherUserId')
  @ApiOperation({ summary: 'Get conversation with another user (Owner/Customer only)' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved', type: [MessageDto] })
  async getConversation(@Req() req: Request & { user: JwtPayload }, @Param('otherUserId') otherUserId: string, @Query('propertyId') propertyId?: string): Promise<MessageDto[]> {
    if (req.user.role === 'ADMIN') throw new ForbiddenException('Admins cannot access messages');
    return this.messageService.getConversation(req.user as unknown as User, otherUserId, propertyId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for current user (Owner/Customer only)' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved', type: [MessageDto] })
  async getMyConversations(@Req() req: Request & { user: JwtPayload }): Promise<MessageDto[]> {
    if (req.user.role === 'ADMIN') throw new ForbiddenException('Admins cannot access messages');
    return this.messageService.getUserConversations(req.user as unknown as User);
  }
} 