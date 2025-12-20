import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const OPENING_LINES = [
  '嘿，最近過得怎麼樣？',
  '先打個招呼：很高興跟你聊天！',
  '今晚有沒有想做的事？',
  '最近有什麼讓你開心的小事嗎？',
  '想聽聽你最近的分享。',
  '今天心情如何？',
  '忙完了嗎？要不要聊點輕鬆的？',
  '最近有沒有好看的電影或好聽的歌？',
  '我在，隨時可以聊天。',
  '你的今天過得怎麼樣？',
];

export async function GET(
  request: NextRequest,
  { params }: { params: { targetUserId: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;
  const { targetUserId } = params;

  try {
    // Get target user's tags
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get current user's tags
    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    // 不做個人化占位，直接回傳固定腳本
    return NextResponse.json({ suggestions: OPENING_LINES });
  } catch (error) {
    console.error('Get opening lines error:', error);
    return NextResponse.json(
      { error: 'Failed to get opening lines' },
      { status: 500 }
    );
  }
}

