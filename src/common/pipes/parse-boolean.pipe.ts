import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ParseBooleanPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    if (value === undefined || value === null) {
      return false;
    }
    
    if (typeof value === 'boolean') {
      return value;
    }
    
    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  }
} 