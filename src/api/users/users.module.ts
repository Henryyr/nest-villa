// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersService } from './users.service';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { UsersRepository } from './users.repository';
import { JwtStrategy } from '../../shared/strategies/jwt.strategies'; 
import { UsersController } from './users.controller';
import { RedisModule } from '../../cache/redis/redis.module';

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
