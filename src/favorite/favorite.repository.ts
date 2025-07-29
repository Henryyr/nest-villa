import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindAllOptions } from '../../common/interfaces/find-all-options.interface';
import { Prisma } from '@prisma/client';
import { IFavoriteRepository } from '../../common/interfaces/favorite-repository.interface';
import { Property } from '@prisma/client';

@Injectable()
export class FavoriteRepository implements IFavoriteRepository {
  constructor(private prisma: PrismaService) {}

  async addToFavorite(userId: string, propertyId: string) {
    console.log(`Adding favorite: userId=${userId}, propertyId=${propertyId}`);
    const result = await this.prisma.favorite.create({ data: { userId, propertyId } });
    console.log(`Successfully added favorite with id: ${result.id}`);
    return result;
  }

  async removeFromFavorite(userId: string, propertyId: string) {
    console.log(`Removing favorite: userId=${userId}, propertyId=${propertyId}`);
    const result = await this.prisma.favorite.deleteMany({ where: { userId, propertyId } });
    console.log(`Removed ${result.count} favorites`);
    return result;
  }

  async findAll(options: FindAllOptions = {}) {
    const { search, page = 1, limit = 10 } = options;
    const where: Prisma.FavoriteWhereInput = {};
    if (search) {
      where.property = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    const [data, total] = await Promise.all([
      this.prisma.favorite.findMany({
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
      this.prisma.favorite.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.favorite.findUnique({
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

  async create(data: Prisma.FavoriteCreateInput) {
    return this.prisma.favorite.create({ data });
  }

  async update(id: string, data: Prisma.FavoriteUpdateInput) {
    return this.prisma.favorite.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.favorite.delete({ where: { id } });
  }

  async getFavorites(userId: string, options: FindAllOptions = {}) {
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
    console.log(`Checking if favorite exists: userId=${userId}, propertyId=${propertyId}`);
    const result = await this.prisma.favorite.findFirst({ where: { userId, propertyId } });
    console.log(`Favorite exists: ${!!result}`);
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
}
