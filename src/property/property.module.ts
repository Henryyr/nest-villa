import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PropertyRepository } from './property.repository';

@Module({
  imports: [PrismaModule],
  providers: [PropertyService, PropertyRepository],
  controllers: [PropertyController],
})
export class PropertyModule {} 