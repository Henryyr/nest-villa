import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { FavoriteRepository } from './favorite.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register(),
    RedisModule,
  ],
  providers: [
    FavoriteService, 
    FavoriteRepository,
  ],
  controllers: [FavoriteController],
})
export class FavoriteModule {} 