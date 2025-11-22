import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    console.log('📊 [Stats API] 開始取得統計資料...');
    
    const [
      totalConversations,
      activeConversations,
      totalMessages,
      recentMessages,
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
    ]);

    console.log('✅ [Stats API] 統計資料取得成功:', {
      totalConversations,
      activeConversations,
      totalMessages,
      recentMessages,
    });

    return NextResponse.json({
      totalConversations,
      activeConversations,
      totalMessages,
      recentMessages,
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

