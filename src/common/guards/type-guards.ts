import { CachedProperty, CachedUser } from '../interfaces/redis.interface';

export function isCachedProperty(obj: unknown): obj is CachedProperty {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'location' in obj &&
    'price' in obj
  );
}

export function isCachedUser(obj: unknown): obj is CachedUser {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj &&
    'role' in obj
  );
} 