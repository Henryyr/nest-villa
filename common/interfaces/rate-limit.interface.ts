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
  