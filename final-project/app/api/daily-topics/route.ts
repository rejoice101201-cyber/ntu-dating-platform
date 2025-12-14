import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: 取得今日主題
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    // 取得今天的日期（只取日期部分，不包含時間）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // 查詢今日主題
    const topic = await prisma.dailyTopic.findFirst({
      where: {
        date: {
          gte: today,
          lte: todayEnd,
        },
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!topic) {
      return NextResponse.json({
        topic: null,
        message: '今日尚無主題',
      });
    }

    return NextResponse.json({
      topic: {
        id: topic.id,
        date: topic.date.toISOString(),
        title: topic.title,
        postCount: topic._count.posts,
        createdAt: topic.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get daily topic error:', error);
    return NextResponse.json(
      { error: 'Failed to get daily topic' },
      { status: 500 }
    );
  }
}

// POST: 建立每日主題（管理員功能，暫時開放給所有登入用戶）
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { title } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // 取得今天的日期（只取日期部分）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // 檢查今天是否已有主題
    const existingTopic = await prisma.dailyTopic.findFirst({
      where: {
        date: {
          gte: today,
          lte: todayEnd,
        },
      },
    });

    if (existingTopic) {
      // 更新現有主題
      const updated = await prisma.dailyTopic.update({
        where: { id: existingTopic.id },
        data: { title: title.trim() },
      });

      return NextResponse.json({
        topic: {
          id: updated.id,
          date: updated.date.toISOString(),
          title: updated.title,
          createdAt: updated.createdAt.toISOString(),
        },
      });
    }

    // 建立新主題
    const topic = await prisma.dailyTopic.create({
      data: {
        date: today,
        title: title.trim(),
      },
    });

    return NextResponse.json({
      topic: {
        id: topic.id,
        date: topic.date.toISOString(),
        title: topic.title,
        createdAt: topic.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create daily topic error:', error);
    
    // 處理唯一約束錯誤（同一天不能有兩個主題）
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '今日主題已存在' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create daily topic' },
      { status: 500 }
    );
  }
}
