import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { PropertyRepository } from './property.repository';
import { RedisModule } from 'src/cache/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register(),
    RedisModule,
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