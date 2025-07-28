import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindAllOptions } from '../../common/interfaces/find-all-options.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class PropertyRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(options: FindAllOptions = {}) {
    const { search, page = 1, limit = 10 } = options;
    const where: Prisma.PropertyWhereInput = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: true,
          villa: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        villa: true,
        facilities: true,
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async createProperty(data: Prisma.PropertyCreateInput) {
    return this.prisma.property.create({ data });
  }

  async updateProperty(id: string, data: Prisma.PropertyUpdateInput) {
    return this.prisma.property.update({ where: { id }, data });
  }

  async deleteProperty(id: string) {
    return this.prisma.property.delete({ where: { id } });
  }
} 