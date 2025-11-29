import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        photos: true,
        tags: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const suggestions = [];

    if (user.photos.length < 3) {
      suggestions.push({
        type: 'photo',
        message: '🐕 建議上傳至少3張照片，讓更多人了解你！',
      });
    }

    if (!user.bio || user.bio.length < 50) {
      suggestions.push({
        type: 'bio',
        message: '🐕 寫一段更詳細的自我介紹，會提高匹配率哦！',
      });
    }

    if (user.tags.length < 5) {
      suggestions.push({
        type: 'tags',
        message: '🐕 新增更多興趣標籤，找到更多共同話題！',
      });
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Get profile suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}

