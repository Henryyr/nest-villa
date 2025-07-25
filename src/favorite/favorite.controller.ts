import { Controller, Post, Delete, Get, Body, Param, Req, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { JwtAuthGuard } from 'common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FavoriteResponseDto } from './dto/favorite-response.dto';
import { Request } from 'express';
import { JwtPayload } from 'common/types';

@ApiTags('favorite')
@UseGuards(JwtAuthGuard)
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add property to favorites' })
  @ApiResponse({ status: 201, description: 'Added to favorites', type: FavoriteResponseDto })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 409, description: 'Already in favorites' })
  addToFavorite(@Req() req: Request & { user: JwtPayload }, @Body() dto: AddFavoriteDto): Promise<FavoriteResponseDto> {
    return this.favoriteService.addToFavorite(req.user.sub, dto.propertyId);
  }

  @Delete(':propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove property from favorites' })
  @ApiResponse({ status: 200, description: 'Removed from favorites', type: Object })
  @ApiResponse({ status: 404, description: 'Property not found' })
  removeFromFavorite(@Req() req: Request & { user: JwtPayload }, @Param('propertyId') propertyId: string): Promise<{ deleted: boolean }> {
    return this.favoriteService.removeFromFavorite(req.user.sub, propertyId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiResponse({ status: 200, description: 'List of favorites', type: [FavoriteResponseDto] })
  getFavorite(
    @Req() req: Request & { user: JwtPayload },
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<FavoriteResponseDto[]> {
    return this.favoriteService.getFavorite(req.user.sub, {
      search,
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }
} 