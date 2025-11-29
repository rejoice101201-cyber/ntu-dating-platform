import { PrismaClient } from '@prisma/client';

// PrismaClient 是单例模式，避免在开发环境中创建多个实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 如果使用 Prisma Accelerate，使用 PRISMA_DATABASE_URL
// 否则使用标准的 DATABASE_URL
const databaseUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set!');
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

