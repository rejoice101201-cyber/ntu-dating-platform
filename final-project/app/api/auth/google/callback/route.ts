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
    const error = req.nextUrl.searchParams.get('error')
    const errorDescription = req.nextUrl.searchParams.get('error_description')
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/google/callback/route.ts:entry',message:'callback entry',data:{hasCode:!!code,hasError:!!error,error:error,errorDescription:errorDescription,origin:req.nextUrl.origin,fullUrl:req.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{})
    // #endregion
    
    if (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/google/callback/route.ts:error',message:'OAuth error from Google',data:{error:error,errorDescription:errorDescription},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{})
      // #endregion
      return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`, req.url))
    }
    
    if (!code) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/google/callback/route.ts:missing-code',message:'missing code',data:{hasCode:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{})
      // #endregion
      return NextResponse.redirect(new URL('/auth/login?error=missing_code', req.url))
    }

    const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/google/callback/route.ts:redirect-uri',message:'using redirect URI',data:{redirectUri:redirectUri,origin:req.nextUrl.origin,expectedLocal:'http://localhost:3000/api/auth/google/callback',expectedProd:'https://ntu-dating-platform-liard.vercel.app/api/auth/google/callback'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{})
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

    // 必須要有 email
    if (!payload?.email) {
      return NextResponse.redirect(new URL('/auth/login?error=google_no_email', req.url))
    }
    const email = payload.email.toLowerCase()

    // 若 Google 回傳 hd，且不是 g.ntu.edu.tw，拒絕
    if (payload.hd && payload.hd !== 'g.ntu.edu.tw') {
      return NextResponse.redirect(new URL('/auth/login?error=google_hd_not_allowed', req.url))
    }

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


