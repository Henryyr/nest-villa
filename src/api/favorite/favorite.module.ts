import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { FavoriteRepository } from './favorite.repository';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { RedisModule } from 'src/cache/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register(),
    RedisModule,
  ],
  providers: [
    FavoriteService, 
    FavoriteRepository,
    { provide: 'IFavoriteRepository', useClass: FavoriteRepository },
  ],
  controllers: [FavoriteController],
})
export class FavoriteModule {} 