import { prisma } from './prisma';

/**
 * 執行數據庫查詢，帶有重試機制
 * @param queryFn 查詢函數
 * @param maxRetries 最大重試次數（默認 3）
 * @param retryDelay 重試延遲（毫秒，默認 1000）
 */
export async function withRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 在 Serverless 環境中，確保連接可用
      if (process.env.NODE_ENV === 'production' && attempt === 1) {
        // 檢查連接狀態，但不阻塞（Prisma 會自動管理連接）
        try {
          await prisma.$queryRaw`SELECT 1`.catch(() => {
            // 忽略檢查錯誤，讓實際查詢來處理
          });
        } catch {
          // 忽略
        }
      }
      
      return await queryFn();
    } catch (error: any) {
      lastError = error;
      
      // 檢查是否是連接錯誤（支援 PostgreSQL 和 MongoDB）
      const isConnectionError = 
        error?.message?.includes('connect') ||
        error?.message?.includes('ECONNREFUSED') ||
        error?.code === 'P1001' || // Can't reach database server
        error?.code === 'P1000' || // Authentication failed
        error?.code === 'P1017' || // Server has closed the connection
        error?.code === 'P2024' || // Timed out fetching a new connection from the connection pool
        error?.code === 'P2025' || // Record not found (有時也會伴隨連接問題)
        error?.message?.includes('timeout') ||
        error?.message?.includes("Can't reach database") ||
        error?.message?.includes('connection') ||
        error?.message?.includes('Connection') ||
        error?.message?.includes('MongoNetworkError') ||
        error?.message?.includes('MongoServerSelectionError') ||
        error?.message?.includes('MongoTimeoutError') ||
        error?.name === 'MongoNetworkError' ||
        error?.name === 'MongoServerSelectionError' ||
        error?.name === 'MongoTimeoutError';
      
      if (isConnectionError && attempt < maxRetries) {
        const delay = retryDelay * attempt; // 指數退避
        console.warn(`[db] Connection error (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`, {
          code: error?.code,
          message: error?.message?.substring(0, 100), // 限制日誌長度
        });
        
        // 在 Serverless 環境中，不要頻繁斷開/重連，讓 Prisma 自己管理
        // 只在最後一次重試前才嘗試重新連接
        if (attempt === maxRetries - 1) {
        try {
          await prisma.$disconnect().catch(() => {
            // 忽略斷開連接時的錯誤
          });
            await new Promise(resolve => setTimeout(resolve, delay));
          await prisma.$connect().catch(() => {
            // 連接失敗會在下次重試時處理
          });
        } catch (reconnectError) {
            console.error('[db] Failed to reconnect:', reconnectError);
          }
        } else {
          // 簡單等待後重試
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        continue;
      }
      
      // 如果不是連接錯誤，或已達最大重試次數，直接拋出
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * 檢查數據庫連接狀態（支援 PostgreSQL 和 MongoDB）
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // MongoDB 使用不同的查詢方式
    const dbUrl = process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL || '';
    if (dbUrl.includes('mongodb')) {
      // MongoDB: 使用 $runCommandRaw（需要類型檢查，因為 PostgreSQL client 沒有這個方法）
      const mongoPrisma = prisma as any;
      if (typeof mongoPrisma.$runCommandRaw === 'function') {
        await mongoPrisma.$runCommandRaw({ ping: 1 });
      }
    } else {
      // PostgreSQL: 使用 SELECT 1
      await prisma.$queryRaw`SELECT 1`;
    }
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

/**
 * 包裝數據庫錯誤，提供更友好的錯誤信息
 */
export function handleDatabaseError(error: any): { message: string; code: string; status: number } {
  const errorMessage = error?.message || String(error);
  const errorCode = error?.code || 'UNKNOWN_ERROR';
  const errorName = error?.name || '';
  
  // 檢查是否是連接錯誤（支援 PostgreSQL 和 MongoDB）
  const isConnectionError = 
    errorMessage.includes('connect') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorCode === 'P1001' || // Can't reach database server
    errorCode === 'P1000' || // Authentication failed
    errorCode === 'P1017' || // Server has closed the connection
    errorCode === 'P2024' || // Timed out fetching a new connection from the connection pool
    errorMessage.includes('timeout') ||
    errorMessage.includes("Can't reach database") ||
    errorMessage.includes('connection') ||
    errorMessage.includes('Connection') ||
    errorMessage.includes('MongoNetworkError') ||
    errorMessage.includes('MongoServerSelectionError') ||
    errorMessage.includes('MongoTimeoutError') ||
    errorMessage.includes('MongoError') ||
    errorName === 'MongoNetworkError' ||
    errorName === 'MongoServerSelectionError' ||
    errorName === 'MongoTimeoutError';
  
  if (isConnectionError) {
    return {
      message: 'Database connection failed. Please try again later.',
      code: 'DB_CONNECTION_ERROR',
      status: 503, // Service Unavailable
    };
  }
  
  // 其他數據庫錯誤
  return {
    message: 'Database operation failed. Please try again later.',
    code: 'DB_ERROR',
    status: 500,
  };
}

