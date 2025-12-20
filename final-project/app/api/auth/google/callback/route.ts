import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

// This route is inherently dynamic (uses searchParams and remote token exchange)
export const dynamic = 'force-dynamic'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')
    if (!code) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/google/callback/route.ts:entry',message:'missing code',data:{hasCode:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{})
      // #endregion
      return NextResponse.redirect(new URL('/auth/login?error=missing_code', req.url))
    }

    const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/google/callback/route.ts:entry',message:'callback start',data:{hasCode:true,origin:req.nextUrl.origin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{})
    // #endregion
    const client = new OAuth2Client({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      redirectUri,
    })

    const { tokens } = await client.getToken({ code, redirect_uri: redirectUri })
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/google/callback/route.ts:token',message:'token exchange result',data:{hasIdToken:!!tokens.id_token,hasAccessToken:!!tokens.access_token},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{})
    // #endregion
    if (!tokens.id_token) {
      return NextResponse.redirect(new URL('/auth/login?error=missing_id_token', req.url))
    }

    // Verify ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload?.email) {
      return NextResponse.redirect(new URL('/auth/login?error=google_no_email', req.url))
    }
    const email = payload.email.toLowerCase()

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-12)
      const hashedPassword = await bcrypt.hash(randomPassword, 10)
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: payload.name || 'Google User',
          birthday: new Date(),
          gender: 'other',
          isVerified: true,
        },
      })
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/google/callback/route.ts:catch',message:'callback error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{})
    // #endregion
    return NextResponse.redirect(new URL('/auth/login?error=google_callback', req.url))
  }
}


