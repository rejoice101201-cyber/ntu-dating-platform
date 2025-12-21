import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withRetry, handleDatabaseError } from '@/lib/dbUtils';

// 僅支援 Email + 密碼登入（UserID 登入已移除）
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
    const email = data.email.trim().toLowerCase();

    // 使用重試機制執行查詢（Prisma 會自動連接，不需要手動 $connect）
    const user = await withRetry(async () => {
      return await prisma.user.findFirst({
        where: { email },
      });
    });

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('User found:', { id: user.id, email: user.email, isActive: user.isActive });

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Login error:', error);
    
    // 使用統一的數據庫錯誤處理
    const dbError = handleDatabaseError(error);
    return NextResponse.json(
      { error: dbError.message, code: dbError.code },
      { status: dbError.status }
    );
  }
}

