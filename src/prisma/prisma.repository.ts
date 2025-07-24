import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaRepository {
  constructor(private prisma: PrismaService) {}

  // Contoh: akses user
  async findUserByEmail(email: string): Promise<any | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: any): Promise<any> {
    return this.prisma.user.create({ data });
  }

  // Tambahkan method lain sesuai kebutuhan
} 