import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: 获取所有匹配的未读消息数量（按 matchId 分组）
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    // 获取用户的所有匹配
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { userId: authUser.id },
          { matchedUserId: authUser.id },
        ],
        status: 'matched',
      },
      select: {
        id: true,
      },
    });

    const matchIds = matches.map(m => m.id);

    if (matchIds.length === 0) {
      return NextResponse.json({ unreadCounts: {}, totalUnread: 0 });
    }

    // 统计每个匹配的未读消息数量
    const unreadMessages = await prisma.message.groupBy({
      by: ['matchId'],
      where: {
        matchId: { in: matchIds },
        senderId: { not: authUser.id }, // 只统计别人发给我的
        isRead: false,
      },
      _count: {
        id: true,
      },
    });

    // 转换为对象格式：{ matchId: count }
    const unreadCounts: Record<string, number> = {};
    let totalUnread = 0;

    unreadMessages.forEach((item) => {
      unreadCounts[item.matchId] = item._count.id;
      totalUnread += item._count.id;
    });

    return NextResponse.json({
      unreadCounts,
      totalUnread,
    });
  } catch (error) {
    console.error('Get unread messages error:', error);
    return NextResponse.json(
      { error: 'Failed to get unread messages' },
      { status: 500 }
    );
  }
}

