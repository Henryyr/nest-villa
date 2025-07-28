// Redis Service Types
export interface CachedProperty {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  type: string;
  images?: Array<{
    id: string;
    url: string;
    propertyId: string;
  }>;
  villa?: {
    id: string;
    bedrooms: number;
    bathrooms: number;
    hasSwimmingPool: boolean;
  } | null;
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
  coordinates?: {
    lat: number;
    lng: number;
  };
  properties?: string[];
}

// PubSub Message Types
export interface PubSubMessage {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
  userId?: string;
}

export interface PropertyUpdateMessage extends PubSubMessage {
  type: 'property-update';
  data: {
    propertyId: string;
    action: 'create' | 'update' | 'delete';
    changes?: Record<string, unknown>;
  };
}

export interface UserUpdateMessage extends PubSubMessage {
  type: 'user-update';
  data: {
    userId: string;
    action: 'profile-update' | 'login' | 'logout';
    changes?: Record<string, unknown>;
  };
}

export interface NotificationMessage extends PubSubMessage {
  type: 'notification';
  data: {
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  };
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  statusCode?: number;
}

export interface RateLimitInfo {
  remaining: number;
  reset: number;
  total: number;
}

// Session Types
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
}

export interface TokenData {
  userId: string;
  type: 'access' | 'refresh' | 'reset';
  expiresAt: Date;
  isRevoked: boolean;
}

// Cache Statistics
export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: number;
} 