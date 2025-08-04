import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PropertyRepository } from './property.repository';
import { QueueModule } from 'src/jobs/queue.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register(),
    QueueModule,
  ],
  providers: [
    PropertyService, 
    PropertyRepository,
    { provide: 'IPropertyRepository', useClass: PropertyRepository },
  ],
  controllers: [PropertyController],
  exports: [PropertyService],
})
export class PropertyModule {} 