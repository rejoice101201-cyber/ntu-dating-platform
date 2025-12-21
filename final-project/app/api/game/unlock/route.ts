import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 使用钥匙解锁照片
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      );
    }

    // 获取解锁进度
    const unlockProgress = await prisma.unlockProgress.findUnique({
      where: {
        userId_targetUserId: {
          userId: authUser.id,
          targetUserId,
        },
      },
    });

    if (!unlockProgress || unlockProgress.keys < 1) {
      return NextResponse.json(
        { error: 'Not enough keys' },
        { status: 400 }
      );
    }

    // 使用一把钥匙，增加解锁进度
    const updatedProgress = await prisma.unlockProgress.update({
      where: {
        userId_targetUserId: {
          userId: authUser.id,
          targetUserId,
        },
      },
      data: {
        keys: { decrement: 1 },
        unlockLevel: { increment: 20 }, // 每把钥匙解锁20%
      },
    });

    return NextResponse.json({ unlockProgress: updatedProgress });
  } catch (error) {
    console.error('Unlock photo error:', error);
    return NextResponse.json(
      { error: 'Failed to unlock photo' },
      { status: 500 }
    );
  }
}

