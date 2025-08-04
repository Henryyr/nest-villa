import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllOptions } from 'src/common/find-all-options';
import { Prisma } from '@prisma/client';
import { IFacilityRepository } from './interfaces/facility-repository.interface';

@Injectable()
export class FacilityRepository implements IFacilityRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(options: FindAllOptions = new FindAllOptions()) {
    const { search, page = 1, limit = 10 } = options;
    const where: Prisma.FacilityWhereInput = {};
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.facility.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              properties: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.facility.count({ where }),
    ]);

    return {
      data: data.map(facility => ({
        ...facility,
        propertyCount: facility._count.properties,
        _count: undefined,
      })),
      total,
      page,
      limit,
    };
  }

  async findById(id: string) {
    return this.prisma.facility.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            properties: true,
          },
        },
      },
    });
  }

  async findByName(name: string) {
    return this.prisma.facility.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  async create(data: Prisma.FacilityCreateInput) {
    return this.prisma.facility.create({ data });
  }

  async update(id: string, data: Prisma.FacilityUpdateInput) {
    return this.prisma.facility.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.facility.delete({
      where: { id },
    });
  }

  async addToProperty(propertyId: string, facilityIds: string[]) {
    await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        facilities: {
          connect: facilityIds.map(id => ({ id })),
        },
      },
    });
  }

  async removeFromProperty(propertyId: string, facilityIds: string[]) {
    await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        facilities: {
          disconnect: facilityIds.map(id => ({ id })),
        },
      },
    });
  }

  async getPropertyFacilities(propertyId: string) {
    return this.prisma.facility.findMany({
      where: {
        properties: {
          some: {
            id: propertyId,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getAvailableFacilitiesForProperty(propertyId: string) {
    // Get all facilities except those already assigned to the property
    return this.prisma.facility.findMany({
      where: {
        properties: {
          none: {
            id: propertyId,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
} 