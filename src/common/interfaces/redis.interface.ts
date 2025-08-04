import { createClient } from '@supabase/supabase-js';
export interface CachedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CachedProperty {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  type: string;
  images: string[];
  latitude?: number;
  longitude?: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CachedLocation {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface PubSubMessage {
  type: string;
  channel: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface SubscriptionCallback {
  (message: PubSubMessage): void;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
}

export interface RateLimitResult {
  remaining: number;
  resetTime: Date;
  isLimited: boolean;
  limit: number;
}

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface TokenData {
  email: string;
  userId: string;
  metadata?: Record<string, unknown>;
  type: TokenType;
  expiresAt: Date;
  isRevoked: boolean;
  createAt: Date
}

export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  RESET_PASSWORD = 'RESET_PASSWORD',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  API_TOKEN = 'API_TOKEN',
  INVITATION_TOKEN = 'INVITATION_TOKEN',
  TWO_FACTOR = 'TWO_FACTOR',
} 