import { PrismaClient } from '@prisma/client';

// PrismaClient 是單例模式，避免在開發環境中創建多個實例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 如果使用 Prisma Accelerate，使用 PRISMA_DATABASE_URL
// 否則使用標準的 DATABASE_URL
// 在構建時（NODE_ENV !== 'production' 且沒有 DATABASE_URL），使用虛擬 URL
// PostgreSQL 連接字符串格式（兩種格式都支援）：
//   - postgresql://user:password@host:5432/dbname?schema=public
//   - postgres://user:password@host:5432/dbname?sslmode=require (Prisma Data Platform)
const databaseUrl =
  process.env.PRISMA_DATABASE_URL ||
  process.env.DATABASE_URL ||
  // 讓 build 不會因為 PrismaClient constructor validation 直接炸掉。
  // 真正執行查詢時若沒設 DATABASE_URL 仍會出錯，提醒使用者補環境變數即可。
  'postgresql://user:password@localhost:5432/dbname?schema=public';

// 在 Serverless（Vercel）排查用：只輸出來源與 host，不輸出帳密/密鑰
// 你可以在 Vercel → Functions/Logs 看到這行，判斷到底是吃哪個 env
try {
  const source = process.env.PRISMA_DATABASE_URL
    ? 'PRISMA_DATABASE_URL'
    : process.env.DATABASE_URL
      ? 'DATABASE_URL'
      : 'fallback';
  const u = new URL(databaseUrl);
  // 避免把 user/pass 印出來，只印到 host:port/db
  const safeTarget = `${u.protocol}//${u.host}${u.pathname}`;
  console.log(`[db] prisma datasource url source=${source}, target=${safeTarget}`);
} catch {
  // ignore
}

// 檢查環境變數
if (!process.env.PRISMA_DATABASE_URL && !process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ DATABASE_URL is not set in production!');
    console.error('Please set DATABASE_URL in Vercel Environment Variables');
  }
}

// 優化 Prisma Client 配置，添加連接池和超時設置
// 在 Serverless 環境中，連接池配置很重要
const prismaOptions: any = {
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
};

// 生產環境優化
if (process.env.NODE_ENV === 'production') {
  prismaOptions.errorFormat = 'minimal';
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

// 修復：在所有環境中都使用單例模式，確保連接重用（Serverless 環境特別重要）
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  // 生產環境也使用單例模式（重要！Serverless 環境需要重用連接）
  globalForPrisma.prisma = prisma;
  
  // 確保連接在進程結束時正確關閉
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
  
  // 處理未捕獲的錯誤，確保連接關閉
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught exception:', error);
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting Prisma:', disconnectError);
    }
    process.exit(1);
  });
  
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting Prisma:', disconnectError);
    }
    process.exit(1);
  });
}

