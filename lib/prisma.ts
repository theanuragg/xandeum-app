// lib/prisma.ts
import { PrismaClient } from '@/app/generated/prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Initialize Prisma Client with proper configuration
 * Requires PRISMA_ACCELERATE_URL environment variable
 */
function createPrismaClient(): PrismaClient | null {
  try {
    const accelerateUrl = process.env.PRISMA_ACCELERATE_URL;

    if (!accelerateUrl) {
      console.warn('PRISMA_ACCELERATE_URL environment variable is required but not set.');
      console.warn('Database operations will be unavailable. Only pRPC data will be used.');
      return null;
    }

    return new PrismaClient({
      accelerateUrl,
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    });
  } catch (error: any) {
    console.error('Failed to initialize Prisma Client:', error.message);
    console.warn('Database operations will be unavailable. Only pRPC data will be used.');
    return null;
  }
}

// Use global variable in development to avoid creating multiple instances
export const db = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production' && db) {
  globalThis.prisma = db;
}

// Export a safe wrapper that checks if db is available
export function isDatabaseAvailable(): boolean {
  return db !== null;
}

export default db;