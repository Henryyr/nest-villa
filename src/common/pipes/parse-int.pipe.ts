import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    const val = parseInt(value, 10);
    
    if (isNaN(val)) {
      throw new BadRequestException({
        message: 'Invalid ID format',
        error: 'ID must be a valid number',
        statusCode: 400,
      });
    }
    
    return val;
  }
} 