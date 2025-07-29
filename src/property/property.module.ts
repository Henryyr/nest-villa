import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PropertyRepository } from './property.repository';
import { RedisModule } from '../redis/redis.module';

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
})
export class PropertyModule {} 