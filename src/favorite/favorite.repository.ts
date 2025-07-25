import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindAllOptions } from '../../common/types';
import { Prisma } from '@prisma/client';

@Injectable()
export class FavoriteRepository {
  constructor(private prisma: PrismaService) {}

  async addToFavorite(userId: string, propertyId: string) {
    return this.prisma.favorite.create({ data: { userId, propertyId } });
  }

  async removeFromFavorite(userId: string, propertyId: string) {
    return this.prisma.favorite.deleteMany({ where: { userId, propertyId } });
  }

  async getFavorite(userId: string, options: FindAllOptions = {}) {
    const { search, page = 1, limit = 10 } = options;

    const where: Prisma.FavoriteWhereInput = {
      userId,
      ...(search && {
        property: {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    };

    return this.prisma.favorite.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        property: {
          include: {
            images: true,
            villa: true,
          },
        },
      },
    });
  }

  async findByUserAndProperty(userId: string, propertyId: string) {
    return this.prisma.favorite.findFirst({ where: { userId, propertyId } });
  }

  async propertyExists(propertyId: string) {
    return this.prisma.property.findUnique({ where: { id: propertyId } });
  }
}
