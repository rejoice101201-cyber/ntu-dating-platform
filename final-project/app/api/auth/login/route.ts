import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

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

    // 检查环境变量
    if (!process.env.DATABASE_URL && !process.env.PRISMA_DATABASE_URL) {
      console.error('DATABASE_URL is not set!');
      return NextResponse.json(
        { 
          error: 'Database configuration error. DATABASE_URL is not set.',
          hint: 'Please check Vercel Environment Variables'
        },
        { status: 500 }
      );
    }

    // Prisma 会在第一次查询时自动连接，不需要显式调用 $connect()
    // 直接进行查询，让 Prisma 自动处理连接
    const user = await prisma.user.findFirst({
      where: { email },
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Login error:', error);
    
    // 检查是否是数据库连接错误
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isConnectionError = 
      errorMessage.includes('connect') || 
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('P1001') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('Can\'t reach database');
    
    if (isConnectionError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check your DATABASE_URL environment variable.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

