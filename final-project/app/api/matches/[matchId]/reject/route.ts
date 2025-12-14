import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST: 拒絕配對請求
export async function POST(
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
    // 取得配對記錄
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // 確認這是別人對我的配對請求
    if (match.matchedUserId !== authUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // 刪除配對請求（拒絕）
    await prisma.match.delete({
      where: { id: matchId },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Reject match error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reject match' },
      { status: 500 }
    );
  }
}
