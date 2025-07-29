// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { IAuthRepository } from '../../common/interfaces/auth-repository.interface';
import { Inject } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthResponseDto, RegisterResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { JwtPayload } from '../../common/interfaces/job-data.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CacheService } from '../redis/cache.service';
import { CachedUser } from '../../common/interfaces/redis.interface';
import { SessionService } from '../redis/session.service';
import { TokenService } from '../redis/token.service';
import { RateLimitService } from '../redis/rate-limit.service';
import { QueueService } from '../redis/queue.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    private jwtService: JwtService,
    private cacheService: CacheService,
    private sessionService: SessionService,
    private tokenService: TokenService,
    private rateLimitService: RateLimitService,
    private queueService: QueueService,
  ) {}

  async register(payload: RegisterAuthDto): Promise<RegisterResponseDto> {
    // Check rate limit for registration
    const rateLimit = await this.rateLimitService.checkRegistrationRateLimit(payload.email);
    if (rateLimit.remaining <= 0) {
      throw new ConflictException('Too many registration attempts. Please try again later.');
    }

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

    // Cache user data
    await this.cacheService.cacheUser(user.id, user as CachedUser);

    // Send welcome email via queue
    await this.queueService.addUserWelcomeJob(user.id, user.email);

    return { user };
  }

  async login(payload: LoginAuthDto, ipAddress?: string): Promise<AuthResponseDto> {
    // Check login rate limit
    const rateLimit = await this.rateLimitService.checkLoginRateLimit(payload.email);
    if (rateLimit.remaining <= 0) {
      throw new UnauthorizedException('Too many login attempts. Please try again later.');
    }

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

    // Create session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.sessionService.createSession(sessionId, {
      userId: user.id,
      email: user.email,
      role: user.role,
      ipAddress,
      lastActivity: Date.now(),
    });

    // Cache user data
    await this.cacheService.cacheUser(user.id, user);

    // Track login activity
    await this.sessionService.trackActivity(sessionId, 'login');

    // Return response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userData } = user;
    return {
      ...tokens,
      user: userData,
      sessionId,
    };
  }

  async getProfile(user: JwtPayload): Promise<UserProfileDto> {
    // Check cache first
    const cached = await this.cacheService.getCachedUser(user.sub);
    if (cached) {
      return {
        id: cached.id,
        name: cached.name,
        email: cached.email,
        phone: cached.phone,
        role: cached.role as 'ADMIN' | 'OWNER' | 'CUSTOMER',
        avatarUrl: cached.avatarUrl,
        createdAt: cached.createdAt,
        updatedAt: cached.updatedAt,
      };
    }

    const profile = await this.authRepository.findById(user.sub);
    if (!profile) {
      throw new NotFoundException('User not found');
    }

    // Cache user profile
    await this.cacheService.cacheUser(user.sub, profile as CachedUser);
    return profile;
  }

  async logout(sessionId: string): Promise<void> {
    // Delete session
    await this.sessionService.deleteSession(sessionId);
    
    // Invalidate user cache
    // Note: We don't invalidate user cache on logout as it might be needed for other sessions
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    // Check rate limit
    const rateLimit = await this.rateLimitService.checkPasswordResetRateLimit(email);
    if (rateLimit.remaining <= 0) {
      throw new ConflictException('Too many password reset requests. Please try again later.');
    }

    // Find user
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If an account with this email exists, a password reset link has been sent.' };
    }

    // Create password reset token
    const token = await this.tokenService.createPasswordResetToken(user.id, email);
    
    // Add email job to queue
    await this.queueService.addEmailJob({
      to: email,
      subject: 'Password Reset Request',
      body: `Click here to reset your password: /reset-password?token=${token}`,
    });

    return { message: 'If an account with this email exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Validate token
    const tokenData = await this.tokenService.validatePasswordResetToken(token);
    if (!tokenData) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.authRepository.updateUser(tokenData.userId, { password: hashedPassword });

    // Delete token
    await this.tokenService.deleteToken(token);

    // Invalidate user cache
    await this.cacheService.invalidateUserCache(tokenData.userId);

    // Delete all user sessions for security
    await this.sessionService.deleteUserSessions(tokenData.userId);

    return { message: 'Password reset successfully' };
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
