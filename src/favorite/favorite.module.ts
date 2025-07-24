import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { FavoriteRepository } from './favorite.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FavoriteService, FavoriteRepository],
  controllers: [FavoriteController],
})
export class FavoriteModule {} 