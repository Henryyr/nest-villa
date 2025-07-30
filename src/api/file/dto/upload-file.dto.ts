import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum FileType {
  PROPERTY_IMAGE = 'PROPERTY_IMAGE',
  USER_AVATAR = 'USER_AVATAR',
  DOCUMENT = 'DOCUMENT',
}

export class UploadFileDto {
  @ApiProperty({ description: 'File type', enum: FileType })
  @IsEnum(FileType)
  fileType: FileType;

  @ApiProperty({ description: 'Property ID (required for property images)' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiProperty({ description: 'File name' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'File content as base64' })
  @IsString()
  fileContent: string;

  @ApiProperty({ description: 'File MIME type' })
  @IsString()
  mimeType: string;
}

// New DTO for multipart file upload
export class UploadFileMultipartDto {
  @ApiProperty({ description: 'File type', enum: FileType })
  @IsEnum(FileType)
  fileType: FileType;

  @ApiProperty({ description: 'Property ID (required for property images)' })
  @IsOptional()
  @IsString()
  propertyId?: string;
}

export class FileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileType: FileType;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  uploadedAt: Date;
}

export class DeleteFileDto {
  @ApiProperty()
  @IsString()
  fileId: string;
} 