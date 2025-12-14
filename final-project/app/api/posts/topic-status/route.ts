import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: 檢查今天是否已發過主題貼文
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    // 取得今天的日期範圍
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // 檢查今天是否已發過主題貼文
    const todayTopicPost = await prisma.post.findFirst({
      where: {
        authorId: authUser.id,
        type: 'TOPIC',
        createdAt: {
          gte: today,
          lte: todayEnd,
        },
      },
      select: {
        id: true,
        createdAt: true,
        topic: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      hasPostedToday: !!todayTopicPost,
      post: todayTopicPost ? {
        id: todayTopicPost.id,
        createdAt: todayTopicPost.createdAt.toISOString(),
        topic: todayTopicPost.topic,
      } : null,
    });
  } catch (error) {
    console.error('Get topic status error:', error);
    return NextResponse.json(
      { error: 'Failed to get topic status' },
      { status: 500 }
    );
  }
}
