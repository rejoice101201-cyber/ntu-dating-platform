import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');
    const messageType = searchParams.get('messageType');
    const role = searchParams.get('role'); // 'user' | 'assistant' | 'system'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    
    if (conversationId) {
      where.conversationId = conversationId;
    }
    
    if (userId) {
      where.lineUserId = userId;
    }
    
    if (messageType) {
      where.messageType = messageType;
    }
    
    if (role) {
      where.role = role;
    }
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    // 取得訊息列表
    const messages = await prisma.message.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        conversation: {
          select: {
            id: true,
            lineUserId: true,
            status: true,
          },
        },
      },
    });

    // 取得總數
    const total = await prisma.message.count({ where });

    return NextResponse.json({
      messages,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('取得訊息列表錯誤:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', message: error?.message },
      { status: 500 }
    );
  }
}

