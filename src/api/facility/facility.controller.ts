import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Role } from 'src/shared/decorators/role.decorator';
import { FacilityService } from './facility.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { FacilityResponseDto } from './dto/facility-response.dto';
import { AddFacilityToPropertyDto } from './dto/add-facility-to-property.dto';
import { RemoveFacilityFromPropertyDto } from './dto/remove-facility-from-property.dto';

@ApiTags('Facilities')
@Controller('facilities')
export class FacilityController {
  constructor(private readonly facilityService: FacilityService) {}

  @Get()
  @ApiOperation({ summary: 'Get all facilities' })
  @ApiQuery({ name: 'search', required: false, description: 'Search facilities by name' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of facilities retrieved successfully',
    type: [FacilityResponseDto],
  })
  async findAll(
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.facilityService.findAll(search, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get facility by ID' })
  @ApiParam({ name: 'id', description: 'Facility ID' })
  @ApiResponse({
    status: 200,
    description: 'Facility retrieved successfully',
    type: FacilityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  async findById(@Param('id') id: string) {
    return this.facilityService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new facility' })
  @ApiResponse({
    status: 201,
    description: 'Facility created successfully',
    type: FacilityResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Facility with this name already exists' })
  async create(@Body() createFacilityDto: CreateFacilityDto) {
    return this.facilityService.create(createFacilityDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update facility' })
  @ApiParam({ name: 'id', description: 'Facility ID' })
  @ApiResponse({
    status: 200,
    description: 'Facility updated successfully',
    type: FacilityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  @ApiResponse({ status: 409, description: 'Facility with this name already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateFacilityDto: UpdateFacilityDto,
  ) {
    return this.facilityService.update(id, updateFacilityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete facility' })
  @ApiParam({ name: 'id', description: 'Facility ID' })
  @ApiResponse({ status: 200, description: 'Facility deleted successfully' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  async delete(@Param('id') id: string) {
    return this.facilityService.delete(id);
  }

  @Post('property/:propertyId/add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('OWNER')
  @Role('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add facilities to property' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({ status: 200, description: 'Facilities added to property successfully' })
  @ApiResponse({ status: 404, description: 'Property or facility not found' })
  async addToProperty(
    @Param('propertyId') propertyId: string,
    @Body() addFacilityDto: AddFacilityToPropertyDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.facilityService.addToProperty(propertyId, addFacilityDto, req.user.sub);
  }

  @Delete('property/:propertyId/remove')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('OWNER')
  @Role('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove facilities from property' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({ status: 200, description: 'Facilities removed from property successfully' })
  async removeFromProperty(
    @Param('propertyId') propertyId: string,
    @Body() removeFacilityDto: RemoveFacilityFromPropertyDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.facilityService.removeFromProperty(propertyId, removeFacilityDto, req.user.sub);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get facilities for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({
    status: 200,
    description: 'Property facilities retrieved successfully',
    type: [FacilityResponseDto],
  })
  async getPropertyFacilities(@Param('propertyId') propertyId: string) {
    return this.facilityService.getPropertyFacilities(propertyId);
  }

  @Get('property/:propertyId/available')
  @ApiOperation({ summary: 'Get available facilities for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({
    status: 200,
    description: 'Available facilities retrieved successfully',
    type: [FacilityResponseDto],
  })
  async getAvailableFacilitiesForProperty(@Param('propertyId') propertyId: string) {
    return this.facilityService.getAvailableFacilitiesForProperty(propertyId);
  }
} 