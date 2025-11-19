import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const OPENING_LINES = [
  "你好！我看到你們有共同的興趣，不如從 {interest} 開始聊起？",
  "🐕 柴犬建議：可以問問他/她關於 {tag} 的看法！",
  "試試這個開場白：'我注意到你喜歡 {tag}，我也是！'",
  "根據你們的匹配度，建議聊聊 {commonInterest}",
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

