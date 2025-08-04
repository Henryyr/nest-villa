export const APP_CONSTANTS = {
  // API Configuration
  API_PREFIX: 'api',
  API_VERSION: 'v1',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // Cache
  CACHE_TTL: 3600, // 1 hour
  CACHE_MAX_ITEMS: 100,
  
  // Rate Limiting
  RATE_LIMIT_TTL: 60, // 1 minute
  RATE_LIMIT_LIMIT: 100,
  
  // JWT
  JWT_EXPIRES_IN: '24h',
  JWT_REFRESH_EXPIRES_IN: '7d',
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Booking
  MAX_BOOKING_DAYS: 30,
  MIN_BOOKING_DAYS: 1,
  
  // Payment
  PAYMENT_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
} as const; 