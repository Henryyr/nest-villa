import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './api/auth/auth.module';
import { UsersModule } from './api/users/users.module';
import { PropertyModule } from './api/property/property.module';
import { WishlistModule } from './api/wishlist/wishlist.module';
import { FavoriteModule } from './api/favorite/favorite.module';
import { RedisModule } from './cache/redis/redis.module';
import { MessageModule } from './api/message/message.module';
import { HealthModule } from './api/health/health.module';
import { WelcomeModule } from './welcome/welcome.module';
import { FileModule } from './api/file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertyModule,
    WishlistModule,
    FavoriteModule,
    RedisModule,
    MessageModule,
    HealthModule,
    WelcomeModule,
    FileModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    const logger = new Logger('AppModule');
    logger.log('Application initialized with Redis services');
  }
}
