import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const loginSchema = z.object({
  identifier: z.string(), // email 或 userId
  password: z.string().optional(),
});

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('Login endpoint called');
    const body = await request.json();
    console.log('Login request body:', { email: body.email });
    const data = loginSchema.parse(body);
    const identifier = data.identifier.trim();
    const emailLike = identifier.includes('@') ? identifier.toLowerCase() : null;

    // Check database connection
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          emailLike ? { email: emailLike } : undefined,
          { userId: identifier },
          { name: { equals: identifier, mode: 'insensitive' } },
        ].filter(Boolean) as any,
      },
    });

    if (!user) {
      console.log('User not found:', identifier);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('User found:', { id: user.id, email: user.email, isActive: user.isActive });

    const hasPassword = !!data.password && data.password.length > 0;
    if (hasPassword) {
      const isValidPassword = await bcrypt.compare(data.password!, user.password);
      if (!isValidPassword) {
        console.log('Invalid password for user:', identifier);
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
    } else {
      // 無密碼登入：僅當 identifier 等於 userId，或 userId 為空且名稱匹配時允許
      const idMatch = user.userId && identifier === user.userId;
      const nameMatch = !user.userId && user.name?.toLowerCase() === identifier.toLowerCase();

      if (!idMatch && !nameMatch) {
        return NextResponse.json({ error: '需要密碼' }, { status: 401 });
      }

      // 若 userId 尚未設定且名稱匹配，嘗試補上 userId（避免下次再失敗）
      if (!user.userId && nameMatch) {
        const conflict = await prisma.user.findFirst({ where: { userId: identifier } });
        if (!conflict) {
          await prisma.user.update({ where: { id: user.id }, data: { userId: identifier } });
          user.userId = identifier;
        }
      }
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

