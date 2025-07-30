import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileRepository } from './file.repository';
import { RedisModule } from 'src/cache/redis/redis.module';
import { PrismaModule } from 'src/database/prisma/prisma.module';

@Module({
  imports: [RedisModule, PrismaModule],
  controllers: [FileController],
  providers: [FileService, FileRepository],
  exports: [FileService],
})
export class FileModule {} 