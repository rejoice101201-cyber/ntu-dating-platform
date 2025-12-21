import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { applyDailyEnergyRefill } from '@/lib/energy';
import { withRetry, handleDatabaseError } from '@/lib/dbUtils';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    // 使用重試機制執行查詢
    const user = await withRetry(async () => {
      return await prisma.user.findUnique({
        where: { id: authUser.id },
        select: {
          id: true,
          email: true,
          name: true,
          birthday: true,
          gender: true,
          location: true,
          height: true,
          bio: true,
          energy: true,
          energyMax: true,
          createdAt: true,
          isVerified: true,
        },
      });
    });

    const refilled = await applyDailyEnergyRefill(authUser.id);
    if (refilled) {
      return NextResponse.json({ user: refilled });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Get auth user error:', error);
    
    // 檢查是否是數據庫連接錯誤
    const dbError = handleDatabaseError(error);
    if (dbError.code === 'DB_CONNECTION_ERROR') {
      return NextResponse.json(
        { error: dbError.message, code: dbError.code },
        { status: dbError.status }
      );
    }
    
    // 其他錯誤視為認證錯誤
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

