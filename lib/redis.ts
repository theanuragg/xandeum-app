import { createClient } from '@redis/client';

let redis: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (redis) {
    return redis;
  }

  redis = createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
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