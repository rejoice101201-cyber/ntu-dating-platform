import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { applyDailyEnergyRefill } from '@/lib/energy';
import { withRetry, handleDatabaseError } from '@/lib/dbUtils';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  occupation: z.string().optional(),
  school: z.string().optional(),
  bloodType: z.string().optional(),
});

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
        include: {
          photos: {
            orderBy: { order: 'asc' },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const refilled = await applyDailyEnergyRefill(authUser.id);
    const finalUser = refilled ? { ...user, ...refilled, photos: user.photos, tags: user.tags } : user;

    const { password, ...userWithoutPassword } = finalUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error('Get user error:', error);
    
    // 使用統一的錯誤處理
    const dbError = handleDatabaseError(error);
    return NextResponse.json(
      { error: dbError.message, code: dbError.code },
      { status: dbError.status }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    // 使用重試機制執行更新
    const updatedUser = await withRetry(async () => {
      return await prisma.user.update({
        where: { id: authUser.id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          bio: true,
          location: true,
          height: true,
          weight: true,
          occupation: true,
          school: true,
          bloodType: true,
          birthday: true,
          gender: true,
          energy: true,
          energyMax: true,
        },
      });
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    console.error('Update user error:', error);
    
    // 使用統一的錯誤處理
    const dbError = handleDatabaseError(error);
    return NextResponse.json(
      { error: dbError.message, code: dbError.code },
      { status: dbError.status }
    );
  }
}

