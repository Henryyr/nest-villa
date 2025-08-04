import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllOptions } from 'src/common/find-all-options';
import { Prisma } from '@prisma/client';
import { IPropertyRepository } from './interfaces/property-repository.interface';

@Injectable()
export class PropertyRepository implements IPropertyRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(options: FindAllOptions = new FindAllOptions()) {
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
          files: {
            where: {
              fileType: 'PROPERTY_IMAGE'
            }
          },
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
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findByOwnerId(ownerId: string, options: FindAllOptions = new FindAllOptions()) {
    const { search, page = 1, limit = 10 } = options;
    const where: Prisma.PropertyWhereInput = {
      ownerId,
    };
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
          files: {
            where: {
              fileType: 'PROPERTY_IMAGE'
            }
          },
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
        files: {
          where: {
            fileType: 'PROPERTY_IMAGE'
          }
        },
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

  async create(data: Prisma.PropertyCreateInput) {
    return this.prisma.property.create({ data });
  }

  async update(id: string, data: Prisma.PropertyUpdateInput) {
    return this.prisma.property.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.property.delete({ where: { id } });
  }
} 