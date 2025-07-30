// Cache interfaces
export interface CachedProperty {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  type: string;
  images?: { id: string; url: string; propertyId: string; }[];
  villa?: { id: string; bedrooms: number; bathrooms: number; hasSwimmingPool: boolean; } | null;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

export interface CachedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CachedLocation {
  name: string;
  coordinates?: { lat: number; lng: number };
  properties?: string[];
}

// PubSub interfaces
export interface PubSubMessage {
  channel: string;
  message: Record<string, unknown>;
  timestamp: number;
  publisher?: string;
}

export interface SubscriptionCallback {
  (message: PubSubMessage): void;
}

// Rate limiting interfaces
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: Record<string, unknown>) => string;
}

export interface RateLimitResult {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Session interfaces
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
}

// Token interfaces
export interface TokenData {
  userId: string;
  email: string;
  type: TokenType;
  metadata?: Record<string, unknown>;
  createdAt: number;
  expiresAt: number;
}

export enum TokenType {
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
  API_TOKEN = 'api_token',
  INVITATION_TOKEN = 'invitation_token',
  TWO_FACTOR_AUTH = 'two_factor_auth',
}