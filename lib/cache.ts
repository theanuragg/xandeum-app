import { getRedisClient } from './redis';
import { env } from './env';

interface CachedValue<T = any> {
  data: T;
  timestamp: number;
}

export class CacheService {
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const redis = await getRedisClient();
      const value = await redis.get(key);
      
      if (!value) {
        return null;
      }

      const cached:  CachedValue<T> = JSON.parse(value);
      return cached.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T, ttlSeconds?:  number): Promise<void> {
    try {
      const redis = await getRedisClient();
      const cached: CachedValue<T> = {
        data: value,
        timestamp: Date.now(),
      };

      const ttl = ttlSeconds || 300;
      await redis.setEx(key, ttl, JSON. stringify(cached));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const redis = await getRedisClient();
      await redis. del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const redis = await getRedisClient();
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const redis = await getRedisClient();
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async flush(): Promise<void> {
    try {
      const redis = await getRedisClient();
      await redis.flushAll();
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }
}

export const cache = new CacheService();