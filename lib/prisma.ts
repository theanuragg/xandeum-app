// filename: prisma.ts

import { PrismaClient } from "@/app/generated/prisma/client";

// Reuse a single instance in dev to avoid hot-reload connection leaks
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // accelerateUrl is required when client is generated with Accelerate
    accelerateUrl: process.env.PRISMA_ACCELERATE_URL as string,
    // Optional logs
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;
