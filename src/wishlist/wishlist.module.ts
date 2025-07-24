import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { WishlistRepository } from './wishlist.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WishlistService, WishlistRepository],
  controllers: [WishlistController],
})
export class WishlistModule {} 