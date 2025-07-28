import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { WishlistRepository } from './wishlist.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register(),
    RedisModule,
  ],
  providers: [
    WishlistService, 
    WishlistRepository,
  ],
  controllers: [WishlistController],
})
export class WishlistModule {} 