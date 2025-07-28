import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { Logger } from '@nestjs/common';

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly SESSION_PREFIX = 'session:';
  private readonly USER_SESSIONS_PREFIX = 'user_sessions:';
  private readonly DEFAULT_SESSION_TTL = 24 * 60 * 60; // 24 hours

  constructor(private readonly redisService: RedisService) {}

  // Create a new session
  async createSession(
    sessionId: string,
    sessionData: SessionData,
    ttl: number = this.DEFAULT_SESSION_TTL,
  ): Promise<void> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${sessionData.userId}`;

    // Store session data
    await this.redisService.hset(sessionKey, 'data', JSON.stringify(sessionData));
    await this.redisService.expire(sessionKey, ttl);

    // Track user's active sessions
    await this.redisService.sadd(userSessionsKey, sessionId);
    await this.redisService.expire(userSessionsKey, ttl);

    this.logger.log(`Created session: ${sessionId} for user: ${sessionData.userId}`);
  }

  // Get session data
  async getSession(sessionId: string): Promise<SessionData | null> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    const sessionData = await this.redisService.hget(sessionKey, 'data');

    if (!sessionData) {
      return null;
    }

    try {
      const parsed = JSON.parse(sessionData) as SessionData;
      // Update last activity
      parsed.lastActivity = Date.now();
      await this.redisService.hset(sessionKey, 'data', JSON.stringify(parsed));
      return parsed;
    } catch (error) {
      this.logger.error(`Error parsing session data: ${error}`);
      return null;
    }
  }

  // Update session data
  async updateSession(sessionId: string, sessionData: Partial<SessionData>): Promise<void> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    const existingData = await this.getSession(sessionId);

    if (!existingData) {
      throw new Error('Session not found');
    }

    const updatedData = { ...existingData, ...sessionData, lastActivity: Date.now() };
    await this.redisService.hset(sessionKey, 'data', JSON.stringify(updatedData));
  }

  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    const sessionData = await this.getSession(sessionId);

    if (sessionData) {
      const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${sessionData.userId}`;
      await this.redisService.del(sessionKey);
      await this.redisService.srem(userSessionsKey, sessionId);
      this.logger.log(`Deleted session: ${sessionId}`);
    }
  }

  // Delete all sessions for a user
  async deleteUserSessions(userId: string): Promise<void> {
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
    const sessionIds = await this.redisService.smembers(userSessionsKey);

    if (sessionIds.length > 0) {
      const pipeline = this.redisService.getClient().pipeline();
      sessionIds.forEach(sessionId => {
        const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
        pipeline.del(sessionKey);
      });
      pipeline.del(userSessionsKey);
      await pipeline.exec();
      this.logger.log(`Deleted ${sessionIds.length} sessions for user: ${userId}`);
    }
  }

  // Get all active sessions for a user
  async getUserSessions(userId: string): Promise<SessionData[]> {
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
    const sessionIds = await this.redisService.smembers(userSessionsKey);
    const sessions: SessionData[] = [];

    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  // Check if session is valid
  async isSessionValid(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    return session !== null;
  }

  // Extend session TTL
  async extendSession(sessionId: string, ttl: number = this.DEFAULT_SESSION_TTL): Promise<void> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    const sessionData = await this.getSession(sessionId);

    if (sessionData) {
      await this.redisService.expire(sessionKey, ttl);
      const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${sessionData.userId}`;
      await this.redisService.expire(userSessionsKey, ttl);
    }
  }

  // Clean up expired sessions
  async cleanupExpiredSessions(): Promise<number> {
    const pattern = `${this.SESSION_PREFIX}*`;
    const sessionKeys = await this.redisService.getClient().keys(pattern);
    let cleanedCount = 0;

    for (const sessionKey of sessionKeys) {
      const ttl = await this.redisService.ttl(sessionKey);
      if (ttl <= 0) {
        const sessionId = sessionKey.replace(this.SESSION_PREFIX, '');
        await this.deleteSession(sessionId);
        cleanedCount++;
      }
    }

    this.logger.log(`Cleaned up ${cleanedCount} expired sessions`);
    return cleanedCount;
  }

  // Get session statistics
  async getSessionStats(): Promise<{
    totalSessions: number;
    activeUsers: number;
    averageSessionDuration: number;
  }> {
    const sessionKeys = await this.redisService.getClient().keys(`${this.SESSION_PREFIX}*`);
    const userSessionKeys = await this.redisService.getClient().keys(`${this.USER_SESSIONS_PREFIX}*`);

    return {
      totalSessions: sessionKeys.length,
      activeUsers: userSessionKeys.length,
      averageSessionDuration: this.DEFAULT_SESSION_TTL,
    };
  }

  // Track session activity
  async trackActivity(sessionId: string, activity: string): Promise<void> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    const activityKey = `${sessionKey}:activity`;
    
    await this.redisService.lpush(activityKey, JSON.stringify({
      activity,
      timestamp: Date.now(),
    }));
    
    // Keep only last 100 activities
    await this.redisService.getClient().ltrim(activityKey, 0, 99);
    await this.redisService.expire(activityKey, this.DEFAULT_SESSION_TTL);
  }

  // Get session activity
  async getSessionActivity(sessionId: string): Promise<Record<string, unknown>[]> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    const activityKey = `${sessionKey}:activity`;
    const activities = await this.redisService.lrange(activityKey, 0, -1);
    
    return activities.map(activity => JSON.parse(activity));
  }
} 