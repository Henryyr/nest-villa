import { CachedProperty, CachedUser, CachedLocation } from '../interfaces/redis.interface';

/**
 * Type guard untuk memvalidasi CachedProperty
 */
export function isCachedProperty(data: unknown): data is CachedProperty {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'title' in data &&
    'description' in data &&
    'location' in data &&
    'price' in data &&
    'type' in data &&
    'createdAt' in data &&
    'updatedAt' in data &&
    'ownerId' in data
  );
}

/**
 * Type guard untuk memvalidasi CachedUser
 */
export function isCachedUser(data: unknown): data is CachedUser {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'email' in data &&
    'phone' in data &&
    'role' in data &&
    'createdAt' in data &&
    'updatedAt' in data
  );
}

/**
 * Type guard untuk memvalidasi CachedLocation
 */
export function isCachedLocation(data: unknown): data is CachedLocation {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data
  );
}

/**
 * Type guard untuk memvalidasi object dengan properties tertentu
 */
export function hasProperties<T extends Record<string, unknown>>(
  data: unknown, 
  properties: (keyof T)[]
): data is T {
  return (
    typeof data === 'object' &&
    data !== null &&
    properties.every(prop => prop in data)
  );
}