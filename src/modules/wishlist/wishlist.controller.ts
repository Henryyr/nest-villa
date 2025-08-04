import { Controller, Get, Post, Delete, Param, UseGuards, Request, Body, Query, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddWishlistDto } from './dto/add-wishlist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { FindAllOptions } from '../../common/find-all-options';
import { JwtPayload } from '../../common/interfaces/job-data.interface';

@ApiTags('wishlist')
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add property to wishlist' })
  @ApiResponse({ status: 201, description: 'Added to wishlist', type: WishlistResponseDto })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 409, description: 'Already in wishlist' })
  addToWishlist(@Req() req: Request & { user: JwtPayload }, @Body() dto: AddWishlistDto): Promise<WishlistResponseDto> {
    return this.wishlistService.addToWishlist(req.user.sub, dto.propertyId);
  }

  @Delete(':propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove property from wishlist' })
  @ApiResponse({ status: 200, description: 'Removed from wishlist', type: Object })
  @ApiResponse({ status: 404, description: 'Property not found' })
  removeFromWishlist(@Req() req: Request & { user: JwtPayload }, @Param('propertyId') propertyId: string): Promise<{ deleted: boolean }> {
    return this.wishlistService.removeFromWishlist(req.user.sub, propertyId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiResponse({ status: 200, description: 'List of wishlist', type: [WishlistResponseDto] })
  getWishlist(
    @Req() req: Request & { user: JwtPayload },
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<WishlistResponseDto[]> {
    return this.wishlistService.getWishlist(req.user.sub, new FindAllOptions({
      search,
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
    }));
  }
} 