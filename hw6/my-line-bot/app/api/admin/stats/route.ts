import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    console.log('📊 [Stats API] 開始取得統計資料...');
    
    const [
      totalConversations,
      activeConversations,
      totalMessages,
      recentMessages,
      recentMessagesWithMetadata,
    ] = await Promise.all([
      prisma.conversation.count(),
      prisma.conversation.count({
        where: { status: 'active' },
      }),
      prisma.message.count(),
      prisma.message.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 最近 24 小時
          },
        },
      }),
      prisma.message.findMany({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 最近 24 小時
          },
          metadata: {
            not: Prisma.JsonNull,
          },
        },
        select: {
          metadata: true,
        },
        take: 1000, // 限制查詢數量以避免效能問題
      }),
    ]);

    // 計算效能統計
    const responseTimes: number[] = [];
    let slowQueries = 0;
    
    for (const msg of recentMessagesWithMetadata) {
      if (msg.metadata && typeof msg.metadata === 'object') {
        const metadata = msg.metadata as any;
        if (typeof metadata.processingTime === 'number') {
          responseTimes.push(metadata.processingTime);
          if (metadata.processingTime > 3000) {
            slowQueries++;
          }
        }
      }
    }
    
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

    console.log('✅ [Stats API] 統計資料取得成功:', {
      totalConversations,
      activeConversations,
      totalMessages,
      recentMessages,
      avgResponseTime,
      slowQueries,
    });

    return NextResponse.json({
      totalConversations,
      activeConversations,
      totalMessages,
      recentMessages,
      performance: {
        avgResponseTime,
        slowQueries,
        recentResponseTimes: responseTimes.slice(0, 100), // 只返回最近 100 筆
        sampleSize: responseTimes.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ [Stats API] 取得統計資料錯誤:', error);
    console.error('❌ [Stats API] 錯誤詳情:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      name: error?.name,
    });
    
    // 如果是資料庫連接錯誤，提供更詳細的錯誤訊息
    if (error?.code === 'P1001') {
      console.error('❌ [Stats API] 資料庫連接失敗，請檢查 DATABASE_URL 環境變數');
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: '無法連接到資料庫伺服器。請檢查 DATABASE_URL 環境變數設定。',
          code: error?.code,
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch stats', 
        message: error?.message || 'Unknown error',
        code: error?.code,
      },
      { status: 500 }
    );
  }
}

