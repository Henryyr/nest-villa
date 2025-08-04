import { Module } from '@nestjs/common';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { WishlistRepository } from './wishlist.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { QueueModule } from '../../jobs/redis.module';

@Module({
  imports: [PrismaModule, QueueModule],
  controllers: [WishlistController],
  providers: [
    WishlistService,
    {
      provide: 'IWishlistRepository',
      useClass: WishlistRepository,
    },
  ],
  exports: [WishlistService],
})
export class WishlistModule {} 