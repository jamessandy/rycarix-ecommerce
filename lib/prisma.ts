// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_DuIeq67Eapnk@ep-steep-lab-b5zk7qie-pooler.c-7.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: DEFAULT_DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
