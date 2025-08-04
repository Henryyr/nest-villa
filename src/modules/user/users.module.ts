// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersService } from './users.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersRepository } from './users.repository';
import { JwtStrategy } from '../../common/jwt.strategies'; 
import { UsersController } from './users.controller';
import { QueueModule } from '../../jobs/queue.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register(),
    QueueModule,
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
