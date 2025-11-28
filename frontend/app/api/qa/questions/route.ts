import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '5');

    const questions = await prisma.question.findMany({
      where: {
        isActive: true,
        ...(category && { category: category as string }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    return NextResponse.json(
      { error: 'Failed to get questions' },
      { status: 500 }
    );
  }
}

