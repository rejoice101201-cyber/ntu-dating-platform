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

    // 檢查密碼格式（bcrypt hash 應該以 $2a$, $2b$, 或 $2y$ 開頭）
    const passwordHash = user.password;
    const isBcryptHash = passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$') || passwordHash.startsWith('$2y$');
    
    if (!isBcryptHash) {
      console.error('Password hash format invalid for user:', email, 'Hash format:', passwordHash.substring(0, 10));
      return NextResponse.json(
        { error: '帳號密碼格式錯誤，請使用忘記密碼功能重設' },
        { status: 401 }
      );
    }

    // 確保密碼沒有前後空白
    const cleanPassword = data.password.trim();
    
    const isValidPassword = await bcrypt.compare(cleanPassword, passwordHash);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email, 'Hash length:', passwordHash.length);
      // 不記錄實際密碼，但記錄一些調試信息
      console.log('Password comparison failed - hash prefix:', passwordHash.substring(0, 7));
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

