// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersRepository } from './users.repository';
import { JwtStrategy } from 'common/strategies/jwt.strategies'; 
import { UsersController } from './users.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register(),
    RedisModule,
  ],
  providers: [
    UsersService, 
    UsersRepository, 
    { provide: 'IUsersRepository', useClass: UsersRepository },
    JwtStrategy,
  ],
  exports: [UsersService, UsersRepository],
  controllers: [UsersController],
})
export class UsersModule {}
