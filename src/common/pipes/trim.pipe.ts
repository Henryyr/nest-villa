import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  }
} 