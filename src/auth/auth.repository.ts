import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { UserProfileDto } from './dto/auth-response.dto';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<UserProfileDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) return null;
    
    const { password, ...userData } = user;
    return userData;
  }

  async createUser(data: RegisterAuthDto & { password: string }): Promise<UserProfileDto> {
    const user = await this.prisma.user.create({
      data,
    });
    
    const { password: _, ...userData } = user;
    return userData;
  }
}
