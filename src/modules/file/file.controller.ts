import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/decorators/role.decorator';
import { FileService } from './file.service';
import { UploadFileDto, FileResponseDto, UploadFileMultipartDto } from './dto/upload-file.dto';
import { Request } from 'express';
import { JwtPayload } from 'src/common/interfaces/job-data.interface';

@ApiTags('files')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('OWNER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload file (Owner only)' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: FileResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file or data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only owners can upload files' })
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: UploadFileDto,
  ): Promise<FileResponseDto> {
    return await this.fileService.uploadFile(dto, req.user.sub);
  }

  @Post('upload-multipart')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('OWNER')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file with multipart form (Owner only)' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: FileResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file or data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only owners can upload files' })
  @HttpCode(HttpStatus.CREATED)
  async uploadFileMultipart(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: UploadFileMultipartDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileResponseDto> {
    return await this.fileService.uploadFileMultipart(dto, file, req.user.sub);
  }

  @Get('my-files')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('OWNER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user files (Owner only)' })
  @ApiResponse({ status: 200, description: 'User files retrieved', type: [FileResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only owners can access' })
  @HttpCode(HttpStatus.OK)
  async getUserFiles(@Req() req: Request & { user: JwtPayload }): Promise<FileResponseDto[]> {
    return await this.fileService.getUserFiles(req.user.sub);
  }

  @Get(':fileId')
  @ApiOperation({ summary: 'Get file information' })
  @ApiResponse({ status: 200, description: 'File information retrieved', type: FileResponseDto })
  @ApiResponse({ status: 404, description: 'File not found' })
  @HttpCode(HttpStatus.OK)
  async getFile(@Param('fileId') fileId: string): Promise<FileResponseDto> {
    return await this.fileService.getFile(fileId);
  }

  @Delete(':fileId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('OWNER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete file (Owner only - can only delete own files)' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only owners can delete files' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @HttpCode(HttpStatus.OK)
  async deleteFile(
    @Req() req: Request & { user: JwtPayload },
    @Param('fileId') fileId: string,
  ): Promise<void> {
    return await this.fileService.deleteFile(fileId, req.user.sub);
  }

  @Get('property/:propertyId/images')
  @ApiOperation({ summary: 'Get property images' })
  @ApiResponse({ status: 200, description: 'Property images retrieved', type: [FileResponseDto] })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @HttpCode(HttpStatus.OK)
  async getPropertyImages(@Param('propertyId') propertyId: string): Promise<FileResponseDto[]> {
    return await this.fileService.getPropertyImages(propertyId);
  }
} 