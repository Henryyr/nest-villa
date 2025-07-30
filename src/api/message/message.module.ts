import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageRepository } from './message.repository';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { MessageProcessor } from './message.processor';
import { RedisModule } from 'src/cache/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register(),
    RedisModule,
  ],
  controllers: [MessageController],
  providers: [
    MessageService, 
    MessageRepository, 
    MessageProcessor,
  ],
  exports: [MessageService],
})
export class MessageModule {} 