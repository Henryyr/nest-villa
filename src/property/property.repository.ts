import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertyRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { type?: string; search?: string; page?: number; limit?: number }) {
    const { type, search, page = 1, limit = 10 } = params;
    const where: any = {};
    if (type) where.type = type;
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
          type: true,
          images: { select: { url: true }, take: 1 }, // ambil satu gambar sebagai thumbnail
        },
      }),
      this.prisma.property.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    return this.prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        villa: true,
        reviews: true,
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

  async findVillaDetail(id: string) {
    return this.prisma.villa.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            images: true,
            reviews: true,
            facilities: true,
          },
        },
      },
    });
  }
} 