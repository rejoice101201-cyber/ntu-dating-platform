import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { applyDailyEnergyRefill } from '@/lib/energy';

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
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
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

    const updatedUser = await prisma.user.update({
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

