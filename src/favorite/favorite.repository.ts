import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoriteRepository {
  constructor(private prisma: PrismaService) {}

  addToFavorite(userId: string, propertyId: string) {
    return this.prisma.favorite.create({ data: { userId, propertyId } });
  }

  removeFromFavorite(userId: string, propertyId: string) {
    return this.prisma.favorite.deleteMany({ where: { userId, propertyId } });
  }

  getFavorite(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { property: { include: { images: true, villa: true } } },
    });
  }
} 