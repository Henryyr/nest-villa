import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindAllOptions } from '../../common/interfaces/find-all-options.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class WishlistRepository {
  constructor(private prisma: PrismaService) {}

  async addToWishlist(userId: string, propertyId: string) {
    return this.prisma.wishlist.create({ data: { userId, propertyId } });
  }

  async removeFromWishlist(userId: string, propertyId: string) {
    return this.prisma.wishlist.deleteMany({ where: { userId, propertyId } });
  }

  async getWishlist(userId: string, options: FindAllOptions = {}) {
    const { search, page = 1, limit = 10 } = options;

    const where: Prisma.WishlistWhereInput = {
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

    return this.prisma.wishlist.findMany({
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
    return this.prisma.wishlist.findFirst({ where: { userId, propertyId } });
  }

  async propertyExists(propertyId: string) {
    return this.prisma.property.findUnique({ where: { id: propertyId } });
  }
} 