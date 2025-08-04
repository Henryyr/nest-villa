export class FindAllOptions {
  search?: string;
  page: number = 1;
  limit: number = 10;

  constructor(options?: Partial<FindAllOptions>) {
    if (options) {
      Object.assign(this, options);
    }
  }
} 