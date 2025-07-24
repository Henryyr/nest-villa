// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ProfileAuthDto } from './dto/profile-auth.dto';

@Injectable()
export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  async register(payload: RegisterAuthDto) {
    return this.authRepository.register(payload);
  }

  async login(email: string, password: string) {
    return this.authRepository.login(email, password);
  }

  async getProfile(user: any): Promise<ProfileAuthDto> {
    return this.authRepository.getProfile(user);
  }
}
