import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { WishlistRepository } from './wishlist.repository';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { RedisModule } from '../../cache/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register(),
    RedisModule,
  ],
  providers: [
    WishlistService, 
    WishlistRepository,
    { provide: 'IWishlistRepository', useClass: WishlistRepository },
  ],
  controllers: [WishlistController],
})
export class WishlistModule {} 