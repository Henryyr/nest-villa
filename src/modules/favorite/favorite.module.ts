import { Module } from '@nestjs/common';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';
import { FavoriteRepository } from './favorite.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { QueueModule } from '../../jobs/redis.module';

@Module({
  imports: [PrismaModule, QueueModule],
  controllers: [FavoriteController],
  providers: [
    FavoriteService,
    {
      provide: 'IFavoriteRepository',
      useClass: FavoriteRepository,
    },
  ],
  exports: [FavoriteService],
})
export class FavoriteModule {} 