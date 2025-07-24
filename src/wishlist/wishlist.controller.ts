import { Controller, Post, Delete, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddWishlistDto } from './dto/add-wishlist.dto';
import { JwtAuthGuard } from 'common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  addToWishlist(@Req() req, @Body() dto: AddWishlistDto) {
    return this.wishlistService.addToWishlist(req.user.id, dto.propertyId);
  }

  @Delete(':propertyId')
  removeFromWishlist(@Req() req, @Param('propertyId') propertyId: string) {
    return this.wishlistService.removeFromWishlist(req.user.id, propertyId);
  }

  @Get()
  getWishlist(@Req() req) {
    return this.wishlistService.getWishlist(req.user.id);
  }
} 