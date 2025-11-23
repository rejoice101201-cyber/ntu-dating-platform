import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * 驗證資料庫連接字串格式
 */
function isValidDatabaseUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // 檢查是否為有效的 PostgreSQL 連接字串格式
  const isValidFormat = /^postgres(ql)?:\/\//.test(url);
  if (!isValidFormat) return false;
  
  // 檢查是否包含必要的連接資訊（至少要有 @ 符號，表示有認證資訊）
  const hasAuthInfo = url.includes('@');
  if (!hasAuthInfo) return false;
  
  // 嘗試解析 URL 以驗證格式
  try {
    const urlObj = new URL(url);
    // 檢查是否有主機名
    if (!urlObj.hostname || urlObj.hostname.length === 0) return false;
    
    // 檢查是否有資料庫名稱（pathname 應該包含資料庫名）
    if (!urlObj.pathname || urlObj.pathname.length <= 1) {
      // 允許沒有 pathname 的情況（某些連接字串格式）
      console.warn('⚠️ [Database] 連接字串缺少資料庫名稱');
    }
    
    // 檢查是否有明顯錯誤的主機名格式（只有主機名，沒有協議前綴的情況）
    // 如果整個 URL 只是一個主機名加端口，這可能是錯誤的
    if (urlObj.hostname && !url.includes('://') && url.split('@').length === 1) {
      return false;
    }
    
    return true;
  } catch (e) {
    // 如果無法解析為有效 URL，檢查是否至少包含基本格式
    // 例如：postgres://user:pass@host:port/db
    const basicPattern = /^postgres(ql)?:\/\/[^@]+@[^:]+:\d+\/[^?]+/;
    return basicPattern.test(url);
  }
}

/**
 * 取得並驗證資料庫連接字串
 */
function getDatabaseUrl(): string {
  let dbUrl = process.env.DATABASE_URL;
  
  // 如果 DATABASE_URL 不存在或格式錯誤，嘗試 POSTGRES_URL
  if (!dbUrl || !isValidDatabaseUrl(dbUrl)) {
    if (dbUrl) {
      console.warn('⚠️ [Database] DATABASE_URL 格式錯誤，嘗試使用 POSTGRES_URL');
      console.warn('⚠️ [Database] DATABASE_URL 值（隱藏敏感信息）:', maskDatabaseUrl(dbUrl));
    } else {
      console.warn('⚠️ [Database] DATABASE_URL 不存在，嘗試使用 POSTGRES_URL');
    }
    dbUrl = process.env.POSTGRES_URL;
  }
  
  // 驗證 POSTGRES_URL（如果使用）
  if (!dbUrl || !isValidDatabaseUrl(dbUrl)) {
    const error = new Error('DATABASE_URL 和 POSTGRES_URL 都不存在或格式錯誤');
    console.error('❌ [Database] 資料庫連接字串驗證失敗');
    console.error('❌ [Database] DATABASE_URL 存在:', !!process.env.DATABASE_URL);
    console.error('❌ [Database] POSTGRES_URL 存在:', !!process.env.POSTGRES_URL);
    if (process.env.DATABASE_URL) {
      console.error('❌ [Database] DATABASE_URL 值（隱藏敏感信息）:', maskDatabaseUrl(process.env.DATABASE_URL));
    }
    if (process.env.POSTGRES_URL) {
      console.error('❌ [Database] POSTGRES_URL 值（隱藏敏感信息）:', maskDatabaseUrl(process.env.POSTGRES_URL));
    }
    console.error('❌ [Database] 請在 Vercel 環境變數中設定正確的 DATABASE_URL');
    console.error('❌ [Database] 格式應為: postgres://username:password@host:port/database?sslmode=require');
    throw error;
  }
  
  // 記錄使用的資料庫主機（隱藏敏感信息）
  try {
    const urlObj = new URL(dbUrl);
    console.log('✅ [Database] 使用資料庫:', `${urlObj.protocol}//${urlObj.hostname}:${urlObj.port || '5432'}`);
  } catch (e) {
    console.log('✅ [Database] 資料庫連接字串格式正確（已驗證）');
  }
  
  return dbUrl;
}

/**
 * 遮罩資料庫連接字串中的敏感信息
 */
function maskDatabaseUrl(url: string): string {
  if (!url) return '(empty)';
  try {
    const urlObj = new URL(url);
    // 只顯示協議、主機名和端口，隱藏用戶名和密碼
    return `${urlObj.protocol}//***:***@${urlObj.hostname}${urlObj.port ? ':' + urlObj.port : ''}${urlObj.pathname}${urlObj.search}`;
  } catch (e) {
    // 如果無法解析，只顯示前 20 個字符和後 20 個字符
    if (url.length > 40) {
      return url.substring(0, 20) + '...' + url.substring(url.length - 20);
    }
    return url.substring(0, 10) + '***';
  }
}

// 取得並驗證資料庫連接字串
const databaseUrl = getDatabaseUrl();

// 強制設定 DATABASE_URL 環境變數為驗證過的連接字串
// 這確保 Prisma 使用正確的連接字串，而不是可能錯誤的環境變數
process.env.DATABASE_URL = databaseUrl;

console.log('🔧 [Database] 已設定 DATABASE_URL 環境變數（已驗證）');

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl, // 明確指定 URL，覆蓋環境變數
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 在生產環境中，嘗試連接資料庫以驗證連接
if (process.env.NODE_ENV === 'production') {
  prisma.$connect()
    .then(() => {
      console.log('✅ [Database] Prisma Client 連接成功');
    })
    .catch((error: any) => {
      console.error('❌ [Database] Prisma Client 連接失敗:', error);
      console.error('❌ [Database] 使用的連接字串（隱藏敏感信息）:', maskDatabaseUrl(databaseUrl));
    });
}

