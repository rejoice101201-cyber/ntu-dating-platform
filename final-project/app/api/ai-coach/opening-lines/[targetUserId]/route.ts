import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const OPENING_LINES = [
  '我注意到我們都對 {tag} 有興趣，最近有沒有新的發現？',
  '🐕 柴犬提示：先聊聊 {interest}，通常能很快找到共鳴！',
  '如果週末有空，{commonInterest} 相關的活動你會想試試嗎？',
  '我也喜歡 {tag}，好奇你是怎麼入坑的？',
  '看到你標籤有 {interest}，最近有什麼推薦的嗎？',
  '先從最輕鬆的開始：你最喜歡的 {tag} 是什麼？',
  '我最近在找 {commonInterest} 的靈感，想聽聽你的想法～',
  '你會怎麼形容自己在 {interest} 這件事上的風格？',
  '如果要推薦一個給新手的 {tag} 入門，你會說什麼？',
  '聊點有趣的：最近一次關於 {commonInterest} 的小插曲是什麼？',
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

    // Find common tags
    const currentUserTagIds = currentUser?.tags.map((ut: any) => ut.tagId) || [];
    const commonTags = targetUser.tags.filter((ut: any) => currentUserTagIds.includes(ut.tagId));

    // Generate suggestions
    const suggestions = OPENING_LINES.map(line => {
      if (commonTags.length > 0) {
        const randomTag = commonTags[Math.floor(Math.random() * commonTags.length)];
        return line
          .replace('{interest}', randomTag.tag.name)
          .replace('{tag}', randomTag.tag.name)
          .replace('{commonInterest}', randomTag.tag.name);
      }
      return line.replace(/\{[^}]+\}/g, '某個話題');
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Get opening lines error:', error);
    return NextResponse.json(
      { error: 'Failed to get opening lines' },
      { status: 500 }
    );
  }
}

