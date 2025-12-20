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

// 检查环境变量
if (!process.env.PRISMA_DATABASE_URL && !process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ DATABASE_URL is not set in production!');
    console.error('Please set DATABASE_URL in Vercel Environment Variables');
  }
}

// 优化 Prisma Client 配置，添加连接池和超时设置
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // 生产环境优化
  ...(process.env.NODE_ENV === 'production' 
    ? {
        errorFormat: 'minimal',
      }
    : {}),
});

// 在 Serverless 环境中，确保连接在函数结束时关闭
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  // 生产环境：确保连接正确关闭
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

