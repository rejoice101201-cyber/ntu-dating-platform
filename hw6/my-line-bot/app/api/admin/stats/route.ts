import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
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

    return NextResponse.json({
      totalConversations,
      activeConversations,
      totalMessages,
      recentMessages,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('取得統計資料錯誤:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', message: error?.message },
      { status: 500 }
    );
  }
}

