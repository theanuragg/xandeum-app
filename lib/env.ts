import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_API_URL: z. string().url(),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  REDIS_PASSWORD: z.string().optional(),
  PRPC_ENDPOINT: z.string().url(),
  PRPC_SEED_IPS: z.string().transform(s => s.split(',')),
});

type Env = z.infer<typeof envSchema>;

export const env:  Env = envSchema.parse(process.env);