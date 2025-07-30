import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertyModule } from './property/property.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { FavoriteModule } from './favorite/favorite.module';
import { RedisModule } from './redis/redis.module';
import { MessageModule } from './message/message.module';
import { HealthModule } from './health/health.module';
import { WelcomeModule } from './welcome/welcome.module';
import {
  appConfig,
  databaseConfig,
  redisConfig,
  jwtConfig,
  corsConfig,
  securityConfig,
  loggingConfig,
  healthConfig,
  cacheConfig,
  swaggerConfig,
} from '../common/config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        jwtConfig,
        corsConfig,
        securityConfig,
        loggingConfig,
        healthConfig,
        cacheConfig,
        swaggerConfig,
      ],
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
    WelcomeModule
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
