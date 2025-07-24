export class CreatePrismaUserDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: 'ADMIN' | 'OWNER' | 'CUSTOMER';
} 