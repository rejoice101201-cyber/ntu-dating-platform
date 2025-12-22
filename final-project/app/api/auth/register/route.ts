import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ensureMaxEnergy } from '@/lib/energy';

const registerSchema = z.object({
  userId: z.string().optional(), // userId 改為可選，如果沒有提供則自動生成
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  birthday: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  location: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  occupation: z.string().optional(),
  school: z.string().optional(),
  bloodType: z.string().optional(),
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
    console.log('Register endpoint called');
    const body = await request.json();
    console.log('Request body received:', { email: body.email, name: body.name });
    const data = registerSchema.parse(body);

    const lowerEmail = data.email.toLowerCase();
    if (!lowerEmail.includes('@gmail.com')) {
      return NextResponse.json(
        { error: '僅接受 Gmail 帳號註冊' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingByEmail = await prisma.user.findUnique({
      where: { email: lowerEmail },
    });
    if (existingByEmail) {
      return NextResponse.json(
        { error: 'Email 已被使用' },
        { status: 400 }
      );
    }

    // 如果提供了 userId，檢查是否已被使用
    if (data.userId) {
    const existingByUserId = await prisma.user.findFirst({
      where: { userId: data.userId },
    });
    if (existingByUserId) {
      return NextResponse.json(
        { error: 'userID 已被使用' },
        { status: 400 }
      );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user（如果沒有提供 userId，Prisma 會自動生成）
    // 确保energyMax不超过50
    const energyMax = ensureMaxEnergy(50) // 默认50，确保不超过50
    const user = await prisma.user.create({
      data: {
        userId: data.userId || undefined, // 如果沒有提供，使用 undefined 讓 Prisma 自動生成
        email: lowerEmail,
        password: hashedPassword,
        name: data.name,
        birthday: new Date(data.birthday),
        gender: data.gender,
        location: data.location,
        height: data.height,
        weight: data.weight,
        occupation: data.occupation,
        school: data.school,
        bloodType: data.bloodType,
        energyMax: energyMax, // 明确设置为50
        energy: energyMax, // 初始能量也设置为50
      },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        birthday: true,
        gender: true,
        location: true,
        height: true,
        energy: true,
        energyMax: true,
      },
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    return NextResponse.json(
      { user, token },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Registration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

