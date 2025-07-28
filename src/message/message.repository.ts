import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message } from '@prisma/client';

@Injectable()
export class MessageRepository {
  constructor(private prisma: PrismaService) {}

  async createMessage(senderId: string, receiverId: string, content: string, propertyId?: string): Promise<Message> {
    const data = {
      senderId,
      receiverId,
      content,
      ...(propertyId && { propertyId }),
    };

    // Prisma types are strict about optional fields, but our schema allows propertyId to be optional
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.message.create({ data: data as any });
  }

  async getMessagesBetweenUsers(userId1: string, userId2: string, propertyId?: string): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
        ...(propertyId && { propertyId }),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getUserConversations(userId: string): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }
} 