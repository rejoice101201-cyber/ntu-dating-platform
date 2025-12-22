import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { withRetry, handleDatabaseError } from '@/lib/dbUtils';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing Google token' }, { status: 400 });
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      return NextResponse.json({ error: 'Google token invalid' }, { status: 400 });
    }

    const email = payload.email.toLowerCase();
    // Enforce gmail / google workspace only if needed; here allow any Google email
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Email 無效' }, { status: 400 });
    }

    // Find or create user (使用重試機制處理數據庫連接錯誤)
    let user = await withRetry(
      () => prisma.user.findUnique({ where: { email } }),
      3,
      1000
    );
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-12);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await withRetry(
        () => prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: payload.name || 'Google 使用者',
          birthday: new Date(), // placeholder; could be updated later
          gender: 'other',
          isVerified: true,
        },
        }),
        3,
        1000
      );
    }

    if (!user.isActive) {
      return NextResponse.json({ error: '帳號已停用' }, { status: 403 });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword, token });
  } catch (error: any) {
    console.error('Google login error:', error);
    
    // 使用統一的數據庫錯誤處理
    const dbError = handleDatabaseError(error);
    return NextResponse.json(
      { error: dbError.message, code: dbError.code },
      { status: dbError.status }
    );
  }
}


