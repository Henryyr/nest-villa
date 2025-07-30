import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Message, Prisma } from '@prisma/client';

@Injectable()
export class MessageRepository {
  constructor(private prisma: PrismaService) {}

  async createMessage(senderId: string, receiverId: string, content: string, propertyId?: string): Promise<Message> {
    const data: Prisma.MessageCreateInput = {
      sender: { connect: { id: senderId } },
      receiver: { connect: { id: receiverId } },
      content,
      ...(propertyId && { property: { connect: { id: propertyId } } }),
    };

    return this.prisma.message.create({ data });
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