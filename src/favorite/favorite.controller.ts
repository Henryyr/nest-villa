import { Controller, Post, Delete, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { JwtAuthGuard } from 'common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  addToFavorite(@Req() req, @Body() dto: AddFavoriteDto) {
    return this.favoriteService.addToFavorite(req.user.id, dto.propertyId);
  }

  @Delete(':propertyId')
  removeFromFavorite(@Req() req, @Param('propertyId') propertyId: string) {
    return this.favoriteService.removeFromFavorite(req.user.id, propertyId);
  }

  @Get()
  getFavorite(@Req() req) {
    return this.favoriteService.getFavorite(req.user.id);
  }
} 