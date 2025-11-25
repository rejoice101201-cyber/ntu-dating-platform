import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // 'active' | 'ended'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    
    if (userId) {
      where.lineUserId = userId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.lastMessageAt = {};
      if (startDate) {
        where.lastMessageAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.lastMessageAt.lte = new Date(endDate);
      }
    }

    // 取得對話列表
    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: {
        lastMessageAt: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        messages: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 10, // 每個對話只取最近 10 則訊息
        },
      },
    });

    // 取得總數
    const total = await prisma.conversation.count({ where });

    return NextResponse.json({
      conversations,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('取得對話列表錯誤:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations', message: error?.message },
      { status: 500 }
    );
  }
}





