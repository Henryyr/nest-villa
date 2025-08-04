import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageRepository } from './message.repository';
import { MessageProcessor } from './message.processor';
import { PrismaModule } from '../../prisma/prisma.module';
import { QueueModule } from '../../jobs/redis.module';

@Module({
  imports: [PrismaModule, QueueModule],
  controllers: [MessageController],
  providers: [
    MessageService,
    MessageRepository,
    MessageProcessor,
  ],
  exports: [MessageService],
})
export class MessageModule {} 