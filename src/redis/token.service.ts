import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { TokenData, TokenType } from '../../common/interfaces/token-data.interface';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly TOKEN_PREFIX = 'token:';
  private readonly USER_TOKENS_PREFIX = 'user_tokens:';

  constructor(private readonly redisService: RedisService) {}

  // Generate a secure random token
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  // Create a new token
  async createToken(
    userId: string,
    email: string,
    type: TokenType,
    ttl: number = 3600, // 1 hour default
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    const token = this.generateToken();
    const tokenKey = `${this.TOKEN_PREFIX}${token}`;
    const userTokensKey = `${this.USER_TOKENS_PREFIX}${userId}`;

    const tokenData: TokenData = {
      userId,
      email,
      type,
      metadata,
      createdAt: Date.now(),
      expiresAt: Date.now() + (ttl * 1000),
    };

    // Store token data
    await this.redisService.hset(tokenKey, 'data', JSON.stringify(tokenData));
    await this.redisService.expire(tokenKey, ttl);

    // Track user's tokens
    await this.redisService.sadd(userTokensKey, token);
    await this.redisService.expire(userTokensKey, ttl);

    this.logger.log(`Created ${type} token for user: ${userId}`);
    return token;
  }

  // Validate and get token data
  async validateToken(token: string): Promise<TokenData | null> {
    const tokenKey = `${this.TOKEN_PREFIX}${token}`;
    const tokenData = await this.redisService.hget(tokenKey, 'data');

    if (!tokenData) {
      return null;
    }

    try {
      const parsed = JSON.parse(tokenData) as TokenData;
      
      // Check if token is expired
      if (Date.now() > parsed.expiresAt) {
        await this.deleteToken(token);
        return null;
      }

      return parsed;
    } catch (error) {
      this.logger.error(`Error parsing token data: ${error}`);
      return null;
    }
  }

  // Delete a token
  async deleteToken(token: string): Promise<void> {
    const tokenKey = `${this.TOKEN_PREFIX}${token}`;
    const tokenData = await this.validateToken(token);

    if (tokenData) {
      await this.redisService.del(tokenKey);
      const userTokensKey = `${this.USER_TOKENS_PREFIX}${tokenData.userId}`;
      await this.redisService.srem(userTokensKey, token);
      this.logger.log(`Deleted token: ${token}`);
    }
  }

  // Delete all tokens for a user
  async deleteUserTokens(userId: string, type?: TokenType): Promise<void> {
    const userTokensKey = `${this.USER_TOKENS_PREFIX}${userId}`;
    const tokens = await this.redisService.smembers(userTokensKey);

    if (tokens.length > 0) {
      const pipeline = this.redisService.getClient().pipeline();
      
      for (const token of tokens) {
        const tokenData = await this.validateToken(token);
        if (tokenData && (!type || tokenData.type === type)) {
          const tokenKey = `${this.TOKEN_PREFIX}${token}`;
          pipeline.del(tokenKey);
          pipeline.srem(userTokensKey, token);
        }
      }
      
      await pipeline.exec();
      this.logger.log(`Deleted tokens for user: ${userId}`);
    }
  }

  // Get all tokens for a user
  async getUserTokens(userId: string, type?: TokenType): Promise<TokenData[]> {
    const userTokensKey = `${this.USER_TOKENS_PREFIX}${userId}`;
    const tokens = await this.redisService.smembers(userTokensKey);
    const tokenData: TokenData[] = [];

    for (const token of tokens) {
      const data = await this.validateToken(token);
      if (data && (!type || data.type === type)) {
        tokenData.push(data);
      }
    }

    return tokenData;
  }

  // Password reset token methods
  async createPasswordResetToken(userId: string, email: string): Promise<string> {
    return await this.createToken(userId, email, TokenType.PASSWORD_RESET, 3600); // 1 hour
  }

  async validatePasswordResetToken(token: string): Promise<TokenData | null> {
    const tokenData = await this.validateToken(token);
    return tokenData?.type === TokenType.PASSWORD_RESET ? tokenData : null;
  }

  // Email verification token methods
  async createEmailVerificationToken(userId: string, email: string): Promise<string> {
    return await this.createToken(userId, email, TokenType.EMAIL_VERIFICATION, 86400); // 24 hours
  }

  async validateEmailVerificationToken(token: string): Promise<TokenData | null> {
    const tokenData = await this.validateToken(token);
    return tokenData?.type === TokenType.EMAIL_VERIFICATION ? tokenData : null;
  }

  // Access token methods
  async createAccessToken(userId: string, email: string, metadata?: Record<string, unknown>): Promise<string> {
    return await this.createToken(userId, email, TokenType.ACCESS_TOKEN, 3600, metadata); // 1 hour
  }

  async validateAccessToken(token: string): Promise<TokenData | null> {
    const tokenData = await this.validateToken(token);
    return tokenData?.type === TokenType.ACCESS_TOKEN ? tokenData : null;
  }

  // Refresh token methods
  async createRefreshToken(userId: string, email: string, metadata?: Record<string, unknown>): Promise<string> {
    return await this.createToken(userId, email, TokenType.REFRESH_TOKEN, 604800, metadata); // 7 days
  }

  async validateRefreshToken(token: string): Promise<TokenData | null> {
    const tokenData = await this.validateToken(token);
    return tokenData?.type === TokenType.REFRESH_TOKEN ? tokenData : null;
  }

  // API token methods
  async createApiToken(userId: string, email: string, metadata?: Record<string, unknown>): Promise<string> {
    return await this.createToken(userId, email, TokenType.API_TOKEN, 2592000, metadata); // 7 days
  }

  async validateApiToken(token: string): Promise<TokenData | null> {
    const tokenData = await this.validateToken(token);
    return tokenData?.type === TokenType.API_TOKEN ? tokenData : null;
  }

  // Invitation token methods
  async createInvitationToken(userId: string, email: string, metadata?: Record<string, unknown>): Promise<string> {
    return await this.createToken(userId, email, TokenType.INVITATION_TOKEN, 604800, metadata); // 7 days
  }

  async validateInvitationToken(token: string): Promise<TokenData | null> {
    const tokenData = await this.validateToken(token);
    return tokenData?.type === TokenType.INVITATION_TOKEN ? tokenData : null;
  }

  // Two-factor authentication token methods
  async createTwoFactorToken(userId: string, email: string, metadata?: Record<string, unknown>): Promise<string> {
    return await this.createToken(userId, email, TokenType.TWO_FACTOR_AUTH, 300, metadata); // 5 minutes
  }

  async validateTwoFactorToken(token: string): Promise<TokenData | null> {
    const tokenData = await this.validateToken(token);
    return tokenData?.type === TokenType.TWO_FACTOR_AUTH ? tokenData : null;
  }

  // Extend token TTL
  async extendToken(token: string, additionalTtl: number): Promise<void> {
    const tokenKey = `${this.TOKEN_PREFIX}${token}`;
    const tokenData = await this.validateToken(token);

    if (tokenData) {
      const newExpiresAt = Date.now() + (additionalTtl * 1000);
      tokenData.expiresAt = newExpiresAt;
      
      await this.redisService.hset(tokenKey, 'data', JSON.stringify(tokenData));
      await this.redisService.expire(tokenKey, additionalTtl);
    }
  }

  // Get token statistics
  async getTokenStats(): Promise<{
    totalTokens: number;
    activeTokens: number;
    expiredTokens: number;
    tokensByType: Record<TokenType, number>;
  }> {
    const tokenKeys = await this.redisService.getClient().keys(`${this.TOKEN_PREFIX}*`);
    const stats = {
      totalTokens: tokenKeys.length,
      activeTokens: 0,
      expiredTokens: 0,
      tokensByType: {} as Record<TokenType, number>,
    };

    for (const key of tokenKeys) {
      const token = key.replace(this.TOKEN_PREFIX, '');
      const tokenData = await this.validateToken(token);
      
      if (tokenData) {
        stats.activeTokens++;
        stats.tokensByType[tokenData.type] = (stats.tokensByType[tokenData.type] || 0) + 1;
      } else {
        stats.expiredTokens++;
      }
    }

    return stats;
  }

  // Clean up expired tokens
  async cleanupExpiredTokens(): Promise<number> {
    const tokenKeys = await this.redisService.getClient().keys(`${this.TOKEN_PREFIX}*`);
    let cleanedCount = 0;

    for (const key of tokenKeys) {
      const token = key.replace(this.TOKEN_PREFIX, '');
      const tokenData = await this.validateToken(token);
      
      if (!tokenData) {
        await this.deleteToken(token);
        cleanedCount++;
      }
    }

    this.logger.log(`Cleaned up ${cleanedCount} expired tokens`);
    return cleanedCount;
  }
} 