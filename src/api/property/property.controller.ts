import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PropertyService } from './property.service';
import { PropertyResponseDto } from './dto/property-response.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyDetailDto } from './dto/property-detail.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Role } from 'src/shared/decorators/role.decorator';
import { Request } from 'express';
import { JwtPayload } from 'src/shared/interfaces/job-data.interface';

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
  findAll(): Promise<PropertyResponseDto[]> {
    return this.propertyService.findAll();
  }

  @Get('my-properties')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('OWNER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get properties owned by the authenticated owner' })
  @ApiResponse({ status: 200, description: 'List of owner properties', type: [PropertyResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only owners can access' })
  @HttpCode(HttpStatus.OK)
  findMyProperties(@Req() req: Request & { user: JwtPayload }): Promise<PropertyResponseDto[]> {
    return this.propertyService.findByOwnerId(req.user.sub);
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('OWNER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new property (Owner only)' })
  @ApiResponse({ status: 201, description: 'Property created successfully', type: PropertyDetailDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only owners can create properties' })
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: Request & { user: JwtPayload }, @Body() dto: CreatePropertyDto): Promise<PropertyDetailDto> {
    return this.propertyService.createProperty(dto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('OWNER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update property (Owner only - can only update own properties)' })
  @ApiResponse({ status: 200, description: 'Property updated successfully', type: PropertyDetailDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only owners can update properties' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @HttpCode(HttpStatus.OK)
  update(@Req() req: Request & { user: JwtPayload }, @Param('id') id: string, @Body() dto: UpdatePropertyDto): Promise<PropertyDetailDto> {
    return this.propertyService.updateProperty(id, dto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('OWNER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete property (Owner only - can only delete own properties)' })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only owners can delete properties' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @HttpCode(HttpStatus.OK)
  remove(@Req() req: Request & { user: JwtPayload }, @Param('id') id: string): Promise<void> {
    return this.propertyService.deleteProperty(id, req.user.sub);
  }
} 