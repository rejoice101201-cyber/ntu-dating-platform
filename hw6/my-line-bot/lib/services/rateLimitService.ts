import { prisma } from '../db/prisma';

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 分鐘
const MAX_REQUESTS_PER_WINDOW = 3; // 每分鐘最多 3 次請求

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests?: number;
  resetAt?: Date;
}

/**
 * 檢查使用者是否超過速率限制
 */
export async function checkRateLimit(lineUserId: string): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

  try {
    // 取得或建立速率限制記錄
    let rateLimit = await prisma.rateLimit.findUnique({
      where: {
        lineUserId_windowStart: {
          lineUserId,
          windowStart,
        },
      },
    });

    // 如果沒有記錄或已過期，建立新的記錄
    if (!rateLimit || rateLimit.windowStart < windowStart) {
      // 刪除舊記錄
      if (rateLimit) {
        await prisma.rateLimit.delete({
          where: { id: rateLimit.id },
        });
      }

      // 建立新記錄
      rateLimit = await prisma.rateLimit.create({
        data: {
          lineUserId,
          windowStart: new Date(Math.floor(now.getTime() / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS),
          requestCount: 0,
          lastRequestAt: now,
        },
      });
    }

    // 檢查是否超過限制
    if (rateLimit.requestCount >= MAX_REQUESTS_PER_WINDOW) {
      const resetAt = new Date(rateLimit.windowStart.getTime() + RATE_LIMIT_WINDOW_MS);
      return {
        allowed: false,
        remainingRequests: 0,
        resetAt,
      };
    }

    // 更新請求計數
    await prisma.rateLimit.update({
      where: { id: rateLimit.id },
      data: {
        requestCount: rateLimit.requestCount + 1,
        lastRequestAt: now,
      },
    });

    return {
      allowed: true,
      remainingRequests: MAX_REQUESTS_PER_WINDOW - rateLimit.requestCount - 1,
      resetAt: new Date(rateLimit.windowStart.getTime() + RATE_LIMIT_WINDOW_MS),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // 發生錯誤時允許請求（避免阻擋正常使用）
    return {
      allowed: true,
    };
  }
}

/**
 * 清理過期的速率限制記錄
 */
export async function cleanupExpiredRateLimits(): Promise<void> {
  const now = new Date();
  const expiredBefore = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS * 2);

  try {
    await prisma.rateLimit.deleteMany({
      where: {
        windowStart: {
          lt: expiredBefore,
        },
      },
    });
  } catch (error) {
    console.error('Cleanup rate limits error:', error);
  }
}

