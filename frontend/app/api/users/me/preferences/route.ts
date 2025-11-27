import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const preferenceSchema = z.object({
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  minAge: z.number().int().min(18).max(100).nullable().optional(),
  maxAge: z.number().int().min(18).max(100).nullable().optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: authUser } = authResult;

  try {
    const preference = await prisma.matchPreference.findUnique({
      where: { userId: authUser.id },
    });

    return NextResponse.json({ 
      preference: preference || {
        gender: null,
        minAge: null,
        maxAge: null,
      }
    });
  } catch (error) {
    console.error('Get match preference error:', error);
    return NextResponse.json(
      { error: 'Failed to get match preference' },
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
    const validatedData = preferenceSchema.parse(body);

    // Validate age range
    if (validatedData.minAge && validatedData.maxAge) {
      if (validatedData.minAge > validatedData.maxAge) {
        return NextResponse.json(
          { error: '最小年龄不能大于最大年龄' },
          { status: 400 }
        );
      }
    }

    const preference = await prisma.matchPreference.upsert({
      where: { userId: authUser.id },
      update: {
        gender: validatedData.gender ?? null,
        minAge: validatedData.minAge ?? null,
        maxAge: validatedData.maxAge ?? null,
      },
      create: {
        userId: authUser.id,
        gender: validatedData.gender ?? null,
        minAge: validatedData.minAge ?? null,
        maxAge: validatedData.maxAge ?? null,
      },
    });

    return NextResponse.json({ preference });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Update match preference error:', error);
    return NextResponse.json(
      { error: 'Failed to update match preference' },
      { status: 500 }
    );
  }
}

