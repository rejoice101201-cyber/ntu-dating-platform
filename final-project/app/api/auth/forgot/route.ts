import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'your-secret-key';
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: '請提供 Email' }, { status: 400 });
    }

    const lowerEmail = String(email).toLowerCase();
    if (!lowerEmail.includes('@')) {
      return NextResponse.json({ error: 'Email 無效' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (!user) {
      // 不洩漏帳號存在與否
      return NextResponse.json({ ok: true });
    }

    const token = jwt.sign({ email: lowerEmail }, AUTH_SECRET, { expiresIn: '15m' });
    const resetUrl = `${NEXTAUTH_URL || ''}/auth/reset/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to: lowerEmail,
      subject: 'Pikabu 重設密碼連結',
      html: `
        <p>您請求了重設密碼。</p>
        <p>請在 15 分鐘內點擊以下連結重設密碼：</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>若非您本人操作，請忽略此信件。</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: '寄送失敗，請稍後再試' }, { status: 500 });
  }
}


