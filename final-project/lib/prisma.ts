import { PrismaClient } from '@prisma/client';

// PrismaClient 是单例模式，避免在开发环境中创建多个实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 如果使用 Prisma Accelerate，使用 PRISMA_DATABASE_URL
// 否则使用标准的 DATABASE_URL
// 在构建时（NODE_ENV !== 'production' 且没有 DATABASE_URL），使用虚拟 URL
const databaseUrl =
  process.env.PRISMA_DATABASE_URL ||
  process.env.DATABASE_URL ||
  // 讓 build 不會因為 PrismaClient constructor validation 直接炸掉。
  // 真正執行查詢時若沒設 DATABASE_URL 仍會出錯，提醒使用者補環境變數即可。
  'postgresql://user:password@localhost:5432/dbname?schema=public';

if (!process.env.PRISMA_DATABASE_URL && !process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('DATABASE_URL is not set in production!');
  }
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

