import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/user/users.module';
import { PropertyModule } from './modules/property/property.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { QueueModule } from './jobs/queue.module';
import { MessageModule } from './modules/message/message.module';
import { HealthModule } from './modules/health/health.module';
import { WelcomeModule } from './modules/welcome/welcome.module';
import { FileModule } from './modules/file/file.module';
import { FacilityModule } from './modules/facility/facility.module';
import { BookingModule } from './modules/booking/booking.module';
import { PaymentModule } from './modules/payment/payment.module';
import appConfig from './config/app.config';
import prismaConfig from './config/prisma.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, prismaConfig]
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertyModule,
    WishlistModule,
    FavoriteModule,
    QueueModule,
    MessageModule,
    HealthModule,
    WelcomeModule,
    FileModule,
    FacilityModule,
    BookingModule,
    PaymentModule
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
