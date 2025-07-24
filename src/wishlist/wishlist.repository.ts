import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistRepository {
  constructor(private prisma: PrismaService) {}

  addToWishlist(userId: string, propertyId: string) {
    return this.prisma.wishlist.create({ data: { userId, propertyId } });
  }

  removeFromWishlist(userId: string, propertyId: string) {
    return this.prisma.wishlist.deleteMany({ where: { userId, propertyId } });
  }

  getWishlist(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: { property: { include: { images: true, villa: true } } },
    });
  }
} 