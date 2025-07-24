import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertyModule } from './property/property.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { FavoriteModule } from './favorite/favorite.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, PropertyModule, WishlistModule, FavoriteModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
