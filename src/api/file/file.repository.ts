import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { FileType } from '@prisma/client';

@Injectable()
export class FileRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    url: string;
    fileName: string;
    fileType: FileType;
    mimeType: string;
    size: number;
    userId: string;
    propertyId?: string;
  }) {
    return this.prisma.file.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.file.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.file.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async findByPropertyId(propertyId: string) {
    return this.prisma.file.findMany({
      where: { 
        propertyId,
        fileType: FileType.PROPERTY_IMAGE,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async delete(id: string) {
    return this.prisma.file.delete({
      where: { id },
    });
  }

  async deleteByPropertyId(propertyId: string) {
    return this.prisma.file.deleteMany({
      where: { propertyId },
    });
  }
} 