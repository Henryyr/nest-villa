import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseFloatPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    const val = parseFloat(value);
    
    if (isNaN(val)) {
      throw new BadRequestException({
        message: 'Invalid number format',
        error: 'Value must be a valid number',
        statusCode: 400,
      });
    }
    
    return val;
  }
} 