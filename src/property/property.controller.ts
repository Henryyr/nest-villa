import { Controller, Get, Param, Query } from '@nestjs/common';
import { PropertyService } from './property.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('property')
@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  @ApiOperation({ summary: 'List all properties (customer)' })
  @ApiQuery({ name: 'type', required: false, description: 'Property type (VILLA, HOUSE, APARTMENT)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title or location' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'List of properties returned' })
  findAll(
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.propertyService.findAll({ type, search, page: +page, limit: +limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property detail (customer)' })
  @ApiResponse({ status: 200, description: 'Property detail returned' })
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Get('villa/:id')
  @ApiOperation({ summary: 'Get villa detail (customer)' })
  @ApiResponse({ status: 200, description: 'Villa detail returned' })
  findVilla(@Param('id') id: string) {
    return this.propertyService.findVillaDetail(id);
  }
} 