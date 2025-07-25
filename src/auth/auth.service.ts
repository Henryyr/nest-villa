// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthResponseDto, RegisterResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { JwtPayload } from 'common/types';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
  ) {}

  async register(payload: RegisterAuthDto): Promise<RegisterResponseDto> {
    // Check if user already exists
    const existingUser = await this.authRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    // Create user
    const user = await this.authRepository.createUser({
      ...payload,
      password: hashedPassword,
    });

    return { user };
  }

  async login(payload: LoginAuthDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.authRepository.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(payload.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Return response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userData } = user;
    return {
      ...tokens,
      user: userData,
    };
  }

  async getProfile(user: JwtPayload): Promise<UserProfileDto> {
    const profile = await this.authRepository.findById(user.sub);
    if (!profile) {
      throw new NotFoundException('User not found');
    }
    return profile;
  }

  private async generateTokens(user: { id: string; email: string; role: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return { access_token, refresh_token };
  }
}
