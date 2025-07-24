import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ProfileAuthDto } from './dto/profile-auth.dto';

@Injectable()
export class AuthRepository {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(payload: RegisterAuthDto) {
    const hashed = await bcrypt.hash(payload.password, 10);
    const user = await this.usersService.createUser({
      ...payload,
      password: hashed,
    });
    const { password, ...rest } = user;
    return rest;
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid password');

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      type: 'access',
    });

    const refresh_token = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      type: 'refresh',
    }, { expiresIn: '7d' });

    const { password: _password, ...userWithoutPassword } = user;
    return { access_token, refresh_token, user: userWithoutPassword };
  }

  async getProfile(user: any): Promise<ProfileAuthDto> {
    const { password, ...profile } = user;
    return profile;
  }
} 