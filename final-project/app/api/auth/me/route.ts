import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { applyDailyEnergyRefill } from '@/lib/energy';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

