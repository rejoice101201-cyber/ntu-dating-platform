import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const TOPIC_SUGGESTIONS = [
  "聊聊你們共同的興趣",
  "分享最近看過的電影或書籍",
  "討論週末喜歡做什麼",
  "聊聊旅行經歷",
];

export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;
  const { matchId } = params;

  try {
    // Verify match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { userId: authUser.id },
          { matchedUserId: authUser.id },
        ],
      },
      include: {
        user: {
          include: {
            tags: {
              include: { tag: true },
            },
          },
        },
        matchedUser: {
          include: {
            tags: {
              include: { tag: true },
            },
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    const otherUser = match.userId === authUser.id ? match.matchedUser : match.user;
    const currentUser = match.userId === authUser.id ? match.user : match.matchedUser;

    // Find common interests
    const currentUserTagIds = currentUser.tags.map((ut: any) => ut.tagId);
    const commonTags = otherUser.tags.filter((ut: any) => currentUserTagIds.includes(ut.tagId));

    const suggestions = [
      ...TOPIC_SUGGESTIONS,
      ...commonTags.slice(0, 3).map((ut: any) => `聊聊關於 ${ut.tag.name} 的話題`),
    ];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Get topics error:', error);
    return NextResponse.json(
      { error: 'Failed to get topics' },
      { status: 500 }
    );
  }
}

