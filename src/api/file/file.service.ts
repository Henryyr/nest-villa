import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CacheService } from 'src/cache/redis/cache.service';
import { FileRepository } from './file.repository';
import { UploadFileDto, FileResponseDto, FileType, UploadFileMultipartDto } from './dto/upload-file.dto';

interface FileMetadata {
  id: string;
  url: string;
  fileName: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  propertyId?: string;
  userId?: string;
}

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private supabase: SupabaseClient | null;

  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
    private fileRepository: FileRepository,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase Storage not configured. File upload will be disabled.');
      this.supabase = null;
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async uploadFile(dto: UploadFileDto, userId: string): Promise<FileResponseDto> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        throw new BadRequestException('File upload is not configured. Please set up Supabase Storage.');
      }

      // Validate file type and size
      this.validateFile(dto);

      // Generate unique file path
      const filePath = this.generateFilePath(dto, userId);

      // Convert base64 to buffer
      const fileBuffer = Buffer.from(dto.fileContent, 'base64');

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.getBucketName(dto.fileType))
        .upload(filePath, fileBuffer, {
          contentType: dto.mimeType,
          upsert: false,
        });

      if (error) {
        this.logger.error(`Failed to upload file: ${error.message}`);
        throw new BadRequestException('Failed to upload file');
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.getBucketName(dto.fileType))
        .getPublicUrl(filePath);

      // Save to database
      const fileRecord = await this.fileRepository.create({
        url: urlData.publicUrl,
        fileName: dto.fileName,
        fileType: dto.fileType,
        mimeType: dto.mimeType,
        size: fileBuffer.length,
        userId,
        propertyId: dto.propertyId,
      });

      // Cache file metadata
      await this.cacheFileMetadata(fileRecord);

      this.logger.log(`File uploaded successfully: ${fileRecord.id}`);

      return this.toFileResponseDto(fileRecord);
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw error;
    }
  }

  async uploadFileMultipart(dto: UploadFileMultipartDto, file: any, userId: string): Promise<FileResponseDto> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        throw new BadRequestException('File upload is not configured. Please set up Supabase Storage.');
      }

      // Validate file
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new BadRequestException('File size exceeds maximum limit of 10MB');
      }

      // Validate MIME type
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('File type not allowed');
      }

      // Validate property ID for property images
      if (dto.fileType === FileType.PROPERTY_IMAGE && !dto.propertyId) {
        throw new BadRequestException('Property ID is required for property images');
      }

      // Generate unique file path
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = file.originalname.split('.').pop();
      
      let filePath: string;
      switch (dto.fileType) {
        case FileType.PROPERTY_IMAGE:
          filePath = `properties/${dto.propertyId}/${timestamp}-${randomId}.${extension}`;
          break;
        case FileType.USER_AVATAR:
          filePath = `avatars/${userId}/${timestamp}-${randomId}.${extension}`;
          break;
        case FileType.DOCUMENT:
          filePath = `documents/${userId}/${timestamp}-${randomId}.${extension}`;
          break;
        default:
          filePath = `misc/${userId}/${timestamp}-${randomId}.${extension}`;
      }

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.getBucketName(dto.fileType))
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error(`Failed to upload file: ${error.message}`);
        throw new BadRequestException('Failed to upload file');
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.getBucketName(dto.fileType))
        .getPublicUrl(filePath);

      // Save to database
      const fileRecord = await this.fileRepository.create({
        url: urlData.publicUrl,
        fileName: file.originalname,
        fileType: dto.fileType,
        mimeType: file.mimetype,
        size: file.size,
        userId,
        propertyId: dto.propertyId,
      });

      // Cache file metadata
      await this.cacheFileMetadata(fileRecord);

      this.logger.log(`File uploaded successfully: ${fileRecord.id}`);

      return this.toFileResponseDto(fileRecord);
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw error;
    }
  }

  async getFile(fileId: string): Promise<FileResponseDto> {
    try {
      // Try to get from cache first
      const cachedFile = await this.cacheService.get(`file:${fileId}`);
      if (cachedFile) {
        this.logger.log(`File retrieved from cache: ${fileId}`);
        return this.toFileResponseDto(cachedFile);
      }

      // Get from database
      const fileRecord = await this.fileRepository.findById(fileId);
      if (!fileRecord) {
        throw new NotFoundException('File not found');
      }

      // Cache the file metadata
      await this.cacheFileMetadata(fileRecord);

      return this.toFileResponseDto(fileRecord);
    } catch (error) {
      this.logger.error(`Error retrieving file: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      // Check if Supabase is configured
      if (!this.supabase) {
        throw new BadRequestException('File upload is not configured. Please set up Supabase Storage.');
      }

      // Get file from database
      const fileRecord = await this.fileRepository.findById(fileId);
      if (!fileRecord) {
        throw new NotFoundException('File not found');
      }

      // Check if user owns the file
      if (fileRecord.userId !== userId) {
        throw new BadRequestException('You can only delete your own files');
      }

      // Delete from Supabase Storage
      const { error } = await this.supabase.storage
        .from(this.getBucketName(fileRecord.fileType as FileType))
        .remove([this.getFilePathFromUrl(fileRecord.url)]);

      if (error) {
        this.logger.error(`Failed to delete file from storage: ${error.message}`);
        throw new BadRequestException('Failed to delete file');
      }

      // Remove from database
      await this.fileRepository.delete(fileId);

      // Remove from cache
      await this.cacheService.del(`file:${fileId}`);

      this.logger.log(`File deleted successfully: ${fileId}`);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw error;
    }
  }

  async getPropertyImages(propertyId: string): Promise<FileResponseDto[]> {
    try {
      // Try to get from cache first
      const cacheKey = `property:images:${propertyId}`;
      const cachedImages = await this.cacheService.get(cacheKey);
      if (cachedImages) {
        this.logger.log(`Property images retrieved from cache: ${propertyId}`);
        return cachedImages as FileResponseDto[];
      }

      // Get from database
      const images = await this.fileRepository.findByPropertyId(propertyId);

      // Convert to DTOs
      const imageDtos = images.map(image => this.toFileResponseDto(image));

      // Cache the images
      await this.cacheService.set(cacheKey, imageDtos, 3600); // Cache for 1 hour

      return imageDtos;
    } catch (error) {
      this.logger.error(`Error retrieving property images: ${error.message}`);
      throw error;
    }
  }

  async getUserFiles(userId: string): Promise<FileResponseDto[]> {
    try {
      // Try to get from cache first
      const cacheKey = `user:files:${userId}`;
      const cachedFiles = await this.cacheService.get(cacheKey);
      if (cachedFiles) {
        this.logger.log(`User files retrieved from cache: ${userId}`);
        return cachedFiles as FileResponseDto[];
      }

      // Get from database
      const files = await this.fileRepository.findByUserId(userId);

      // Convert to DTOs
      const fileDtos = files.map(file => this.toFileResponseDto(file));

      // Cache the files
      await this.cacheService.set(cacheKey, fileDtos, 1800); // Cache for 30 minutes

      return fileDtos;
    } catch (error) {
      this.logger.error(`Error retrieving user files: ${error.message}`);
      throw error;
    }
  }

  private validateFile(dto: UploadFileDto): void {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const fileSize = Buffer.from(dto.fileContent, 'base64').length;

    if (fileSize > maxSize) {
      throw new BadRequestException('File size exceeds maximum limit of 10MB');
    }

    // Validate MIME type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(dto.mimeType)) {
      throw new BadRequestException('File type not allowed');
    }

    // Validate property ID for property images
    if (dto.fileType === FileType.PROPERTY_IMAGE && !dto.propertyId) {
      throw new BadRequestException('Property ID is required for property images');
    }
  }

  private generateFilePath(dto: UploadFileDto, userId: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = dto.fileName.split('.').pop();
    
    switch (dto.fileType) {
      case FileType.PROPERTY_IMAGE:
        return `properties/${dto.propertyId}/${timestamp}-${randomId}.${extension}`;
      case FileType.USER_AVATAR:
        return `avatars/${userId}/${timestamp}-${randomId}.${extension}`;
      case FileType.DOCUMENT:
        return `documents/${userId}/${timestamp}-${randomId}.${extension}`;
      default:
        return `misc/${userId}/${timestamp}-${randomId}.${extension}`;
    }
  }

  private getBucketName(fileType: FileType): string {
    switch (fileType) {
      case FileType.PROPERTY_IMAGE:
        return 'property-images';
      case FileType.USER_AVATAR:
        return 'user-avatars';
      case FileType.DOCUMENT:
        return 'documents';
      default:
        return 'misc';
    }
  }

  private async cacheFileMetadata(fileMetadata: any): Promise<void> {
    const cacheKey = `file:${fileMetadata.id}`;
    await this.cacheService.set(cacheKey, fileMetadata, 3600); // Cache for 1 hour
  }

  private getFilePathFromUrl(url: string): string {
    // Extract file path from URL
    const urlParts = url.split('/');
    return urlParts.slice(-2).join('/'); // Get last two parts of the path
  }

  private toFileResponseDto(fileRecord: any): FileResponseDto {
    return {
      id: fileRecord.id,
      url: fileRecord.url,
      fileName: fileRecord.fileName,
      fileType: fileRecord.fileType,
      mimeType: fileRecord.mimeType,
      size: fileRecord.size,
      uploadedAt: fileRecord.uploadedAt,
    };
  }
} 