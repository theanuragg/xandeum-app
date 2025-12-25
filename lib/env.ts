import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_API_URL: z. string().url(),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  REDIS_PASSWORD: z.string().optional(),
  GEMINI_API_KEY:  z.string(),
  JUPITER_API_KEY: z.string().optional(),
  PRPC_ENDPOINT: z.string().url(),
  PRPC_SEED_IPS: z.string().transform(s => s.split(',')),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_ADMIN_PASSWORD: z.string().optional(),
  BOT_COMMUNICATION_API_KEY: z. string().optional(),
  BACKEND_URL: z.string().url(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  VALID_API_KEYS: z.string().transform(s => s.split(',')),
  RATE_LIMIT_RPM: z.coerce.number().default(100),
  PNODE_CACHE_TTL: z.coerce.number().default(300),
  STATS_CACHE_TTL: z.coerce.number().default(60),
  HISTORY_CACHE_TTL:  z.coerce.number().default(3600),
  PRICE_CACHE_TTL: z.coerce.number().default(300),
});

type Env = z.infer<typeof envSchema>;

export const env:  Env = envSchema.parse(process.env);