import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST: 接受配對請求
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

    // 檢查是否已經配對
    if (match.status === 'matched') {
      return NextResponse.json({
        success: true,
        match: {
          id: match.id,
          status: 'matched',
        },
      });
    }

    // 更新為 matched
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'matched',
        matchedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      match: {
        id: updatedMatch.id,
        status: updatedMatch.status,
      },
    });
  } catch (error: any) {
    console.error('Accept match error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to accept match' },
      { status: 500 }
    );
  }
}
