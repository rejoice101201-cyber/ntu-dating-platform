import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { withRetry } from '@/lib/dbUtils'

// This route is inherently dynamic (uses searchParams and remote token exchange)
export const dynamic = 'force-dynamic'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')
    const error = req.nextUrl.searchParams.get('error')
    const errorDescription = req.nextUrl.searchParams.get('error_description')
    
    if (error) {
      return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`, req.url))
    }
    
    if (!code) {
      return NextResponse.redirect(new URL('/auth/login?error=missing_code', req.url))
    }

    const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`
    const client = new OAuth2Client({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      redirectUri,
    })

    const { tokens } = await client.getToken({ code, redirect_uri: redirectUri })
    if (!tokens.id_token) {
      return NextResponse.redirect(new URL('/auth/login?error=missing_id_token', req.url))
    }

    // Verify ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    })
    const payload = ticket.getPayload()

    // 必須要有 email
    if (!payload?.email) {
      return NextResponse.redirect(new URL('/auth/login?error=google_no_email', req.url))
    }
    const email = payload.email.toLowerCase()

    // 若 Google 回傳 hd，且不是 g.ntu.edu.tw，拒絕
    if (payload.hd && payload.hd !== 'g.ntu.edu.tw') {
      return NextResponse.redirect(new URL('/auth/login?error=google_hd_not_allowed', req.url))
    }

    // Find or create user (使用重試機制處理數據庫連接錯誤)
    let user = await withRetry(
      () => prisma.user.findUnique({ where: { email } }),
      3, // 最多重試 3 次
      1000 // 每次重試間隔 1 秒
    )
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-12)
      const hashedPassword = await bcrypt.hash(randomPassword, 10)
      user = await withRetry(
        () => prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: payload.name || 'Google User',
            birthday: new Date(),
            gender: 'other',
            isVerified: true,
          },
        }),
        3, // 最多重試 3 次
        1000 // 每次重試間隔 1 秒
      )
    }

    if (!user.isActive) {
      return NextResponse.redirect(new URL('/auth/login?error=inactive', req.url))
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
    const { password, ...userWithoutPassword } = user

    const successUrl = new URL('/auth/google/success', req.nextUrl.origin)
    successUrl.searchParams.set('token', token)
    successUrl.searchParams.set('user', Buffer.from(JSON.stringify(userWithoutPassword)).toString('base64'))
    return NextResponse.redirect(successUrl)
  } catch (error) {
    console.error('[Google Callback] error:', error)
    return NextResponse.redirect(new URL('/auth/login?error=google_callback', req.url))
  }
}


