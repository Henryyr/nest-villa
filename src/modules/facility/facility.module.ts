import { Module } from '@nestjs/common';
import { FacilityController } from './facility.controller';
import { FacilityService } from './facility.service';
import { FacilityRepository } from './facility.repository';
import { PropertyModule } from '../property/property.module';

@Module({
  imports: [PropertyModule],
  controllers: [FacilityController],
  providers: [
    FacilityService,
    {
      provide: 'IFacilityRepository',
      useClass: FacilityRepository,
    },
  ],
  exports: [FacilityService],
})
export class FacilityModule {} 