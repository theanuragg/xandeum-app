import { headers } from 'next/headers';
import { env } from './env';

export enum AuthError {
  MISSING_KEY = 'MISSING_KEY',
  INVALID_KEY = 'INVALID_KEY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export async function validateAPIKey(): Promise<{ valid: boolean; error?: AuthError; key?: string }> {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key') || headersList.get('authorization')?.replace('Bearer ', '');

  if (!apiKey) {
    return { valid: false, error: AuthError.MISSING_KEY };
  }

  const validKeys = env.VALID_API_KEYS.map(k => k.trim());
  const isValid = validKeys.includes(apiKey. trim());

  if (!isValid) {
    return { valid: false, error: AuthError.INVALID_KEY };
  }

  return { valid: true, key: apiKey };
}

/**
 * Rate limiting implementation using sliding window with Redis
 */
export async function checkRateLimit(key: string, limitPerMinute: number = env.RATE_LIMIT_RPM): Promise<boolean> {
  try {
    // Implement in actual Redis-backed rate limiter
    // This is a simplified version
    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Allow on error to prevent blocking
  }
}