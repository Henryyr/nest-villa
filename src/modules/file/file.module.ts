import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileRepository } from './file.repository';
import { QueueModule } from '../../jobs/queue.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [QueueModule, PrismaModule],
  controllers: [FileController],
  providers: [FileService, FileRepository],
  exports: [FileService],
})
export class FileModule {} 