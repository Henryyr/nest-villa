// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersRepository } from './users.repository';
import { JwtStrategy } from 'common/strategies/jwt.strategies'; 
import { UsersController } from './users.controller';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, UsersRepository, JwtStrategy],
  exports: [UsersService, UsersRepository],
  controllers: [UsersController],
})
export class UsersModule {}
