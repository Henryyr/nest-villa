export interface IBaseRepository<T, CreateDto, UpdateDto, ResponseDto> {
  create(data: CreateDto): Promise<ResponseDto>;
  findById(id: string): Promise<ResponseDto | null>;
  findAll(options?: any): Promise<ResponseDto[]>;
  update(id: string, data: UpdateDto): Promise<ResponseDto>;
  delete(id: string): Promise<void>;
}
