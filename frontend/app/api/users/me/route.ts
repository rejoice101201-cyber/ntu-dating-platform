import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  height: z.number().optional(),
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

    const { password, ...userWithoutPassword } = user;

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

