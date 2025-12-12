import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: '缺少 token 或密碼' }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: '密碼至少 6 碼' }, { status: 400 });
    }

    let email = '';
    try {
      const decoded = jwt.verify(token, AUTH_SECRET) as { email?: string };
      email = decoded.email || '';
    } catch {
      return NextResponse.json({ error: '連結已失效或無效' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: '連結無效' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: '重設失敗，請稍後再試' }, { status: 500 });
  }
}


