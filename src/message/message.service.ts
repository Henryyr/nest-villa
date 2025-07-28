import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { User } from '@prisma/client';
import { PubSubService } from '../redis/pubsub.service';
import { QueueService } from '../redis/queue.service';
import { CacheService } from '../redis/cache.service';

@Injectable()
export class MessageService {
  constructor(
    private messageRepository: MessageRepository,
    private pubSubService: PubSubService,
    private queueService: QueueService,
    private cacheService: CacheService,
  ) {}

  async sendEphemeralMessage(sender: User, receiverId: string, content: string, propertyId?: string) {
    if (sender.role === 'ADMIN') {
      throw new ForbiddenException('Admins cannot send messages');
    }
    
    // Add to queue for processing
    await this.queueService.addFileJob({
      type: 'ephemeral-message',
      to: receiverId,
      from: sender.id,
      content,
      propertyId,
      timestamp: Date.now(),
    });
    
    // Send real-time message via pub/sub
    await this.pubSubService.publishMessage(`chat_${receiverId}`, {
      type: 'ephemeral',
      from: sender.id,
      content,
      propertyId,
      timestamp: Date.now(),
    });
    
    return { status: 'queued' };
  }

  async sendMessage(sender: User, receiverId: string, content: string, propertyId?: string) {
    if (sender.role === 'ADMIN') {
      throw new ForbiddenException('Admins cannot send messages');
    }
    
    const message = await this.messageRepository.createMessage(sender.id, receiverId, content, propertyId);
    
    // Send real-time notification
    await this.pubSubService.publishMessage(`chat_${receiverId}`, {
      type: 'new_message',
      message,
      timestamp: Date.now(),
    });
    
    // Cache conversation
    const conversationKey = `conversation:${sender.id}:${receiverId}:${propertyId || 'general'}`;
    const messages = await this.messageRepository.getMessagesBetweenUsers(sender.id, receiverId, propertyId);
    await this.cacheService.set(conversationKey, messages, 3600); // Cache for 1 hour
    
    return message;
  }

  async getConversation(user: User, otherUserId: string, propertyId?: string) {
    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Admins cannot access messages');
    }
    
    // Check cache first
    const conversationKey = `conversation:${user.id}:${otherUserId}:${propertyId || 'general'}`;
    const cached = await this.cacheService.get(conversationKey);
    if (cached && Array.isArray(cached) && cached.length > 0 && 'id' in cached[0]) {
      return cached;
    }
    
    const messages = await this.messageRepository.getMessagesBetweenUsers(user.id, otherUserId, propertyId);
    if (!messages.length) throw new NotFoundException('No conversation found');
    
    // Only allow if user is a participant
    if (!messages.some(m => m.senderId === user.id || m.receiverId === user.id)) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }
    
    // Cache conversation
    await this.cacheService.set(conversationKey, messages, 3600); // Cache for 1 hour
    
    return messages;
  }

  async getUserConversations(user: User) {
    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Admins cannot access messages');
    }
    return this.messageRepository.getUserConversations(user.id);
  }
} 