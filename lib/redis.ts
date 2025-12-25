import { createClient } from '@redis/client';
import { env } from './env';

let redis: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (redis) {
    return redis;
  }

  redis = createClient({
    url: env.REDIS_URL,
    password: env. REDIS_PASSWORD || undefined,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
  });

  redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  await redis.connect().catch((err) => {
    console.error('Failed to connect to Redis:', err);
  });

  return redis;
}

export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}