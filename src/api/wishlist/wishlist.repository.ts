import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { FindAllOptions } from '../../shared/interfaces/find-all-options.interface';
import { Prisma, Wishlist, Property } from '@prisma/client';
import { IWishlistRepository } from '../../shared/interfaces/wishlist-repository.interface';
import { WishlistWithProperty } from '../../shared/types/wishlist-with-property.type';

@Injectable()
export class WishlistRepository implements IWishlistRepository {
  constructor(private prisma: PrismaService) {}

  async addToWishlist(userId: string, propertyId: string): Promise<Wishlist> {
    console.log(`Adding to wishlist: userId=${userId}, propertyId=${propertyId}`);
    const result = await this.prisma.wishlist.create({
      data: { userId, propertyId },
      include: {
        property: {
          include: {
            images: true,
            villa: true,
          },
        },
      },
    });
    console.log(`Added to wishlist: ${result.id}`);
    return result;
  }

  async removeFromWishlist(userId: string, propertyId: string): Promise<{ count: number }> {
    console.log(`Removing from wishlist: userId=${userId}, propertyId=${propertyId}`);
    const result = await this.prisma.wishlist.deleteMany({ where: { userId, propertyId } });
    console.log(`Removed from wishlist: ${result.count} items`);
    return result;
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
    console.log(`Checking if wishlist exists: userId=${userId}, propertyId=${propertyId}`);
    const result = await this.prisma.wishlist.findFirst({ where: { userId, propertyId } });
    console.log(`Wishlist exists: ${!!result}`);
    return result;
  }

  async propertyExists(propertyId: string): Promise<boolean> {
    console.log(`Checking if property exists: propertyId=${propertyId}`);
    const result = await this.prisma.property.findUnique({ where: { id: propertyId } });
    console.log(`Property exists: ${!!result}`);
    return !!result;
  }

  async findPropertyById(propertyId: string): Promise<Property | null> {
    return this.prisma.property.findUnique({ where: { id: propertyId } });
  }

  async findAll(options: FindAllOptions = {}): Promise<{ data: WishlistWithProperty[]; total: number; page: number; limit: number }> {
    const { search, page = 1, limit = 10 } = options;
    const where: Prisma.WishlistWhereInput = {};
    if (search) {
      where.property = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    const [data, total] = await Promise.all([
      this.prisma.wishlist.findMany({
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
      }),
      this.prisma.wishlist.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.wishlist.findUnique({
      where: { id },
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

  async create(data: Prisma.WishlistCreateInput) {
    return this.prisma.wishlist.create({ data });
  }

  async update(id: string, data: Prisma.WishlistUpdateInput) {
    return this.prisma.wishlist.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.wishlist.delete({ where: { id } });
  }
} 