import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertyModule } from './property/property.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { FavoriteModule } from './favorite/favorite.module';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor } from './email.processor';
import { Queue } from 'bullmq';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertyModule,
    WishlistModule,
    FavoriteModule,
    // BullMQ async queue integration (for email, message, etc)
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
      },
    }),
    // Register 'email' queue for async email tasks
    BullModule.registerQueue({ name: 'email' }),
  ],
  controllers: [],
  providers: [EmailProcessor],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    const logger = new Logger('RedisConnection');
    const queue = new Queue('email', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
      },
    });
    try {
      await queue.waitUntilReady();
      logger.log('Redis connected (BullMQ)');
    } catch (err) {
      logger.error('Redis connection failed (BullMQ): ' + err.message);
    } finally {
      await queue.close();
    }
  }
}
