import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PropertyService } from './property.service';
import { PropertyResponseDto } from './dto/property-response.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyDetailDto } from './dto/property-detail.dto';

@ApiTags('property')
@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  @ApiOperation({ summary: 'List all properties' })
  @ApiResponse({ status: 200, description: 'List of properties', type: [PropertyResponseDto] })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title or location' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ data: PropertyResponseDto[]; total: number; page: number; limit: number }> {
    return this.propertyService.findAll({ search, page: +page, limit: +limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  @ApiResponse({ status: 200, description: 'Property detail returned', type: PropertyDetailDto })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<PropertyDetailDto> {
    return this.propertyService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create property' })
  @ApiResponse({ status: 201, description: 'Property created', type: PropertyResponseDto })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePropertyDto): Promise<PropertyResponseDto> {
    return this.propertyService.createProperty(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update property' })
  @ApiResponse({ status: 200, description: 'Property updated', type: PropertyResponseDto })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() dto: UpdatePropertyDto): Promise<PropertyResponseDto> {
    return this.propertyService.updateProperty(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete property' })
  @ApiResponse({ status: 200, description: 'Property deleted', type: PropertyResponseDto })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string): Promise<PropertyResponseDto> {
    return this.propertyService.deleteProperty(id);
  }
} 