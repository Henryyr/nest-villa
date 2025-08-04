import { IBaseRepository } from '../../../common/base-repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { FindAllOptions } from '../../../common/find-all-options';

export interface IUsersRepository extends IBaseRepository<any, CreateUserDto, UpdateUserDto, UserResponseDto> {
  findByEmail(email: string): Promise<any | null>;
  findAll(options?: FindAllOptions): Promise<{ data: any[]; total: number; page: number; limit: number }>;
} 