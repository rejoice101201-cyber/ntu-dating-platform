import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')
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

    // 將 id_token 帶回登入頁，由前端既有流程處理
    const loginUrl = new URL('/auth/login', req.nextUrl.origin)
    loginUrl.hash = `id_token=${encodeURIComponent(tokens.id_token)}`
    return NextResponse.redirect(loginUrl)
  } catch (error) {
    console.error('[Google Callback] error:', error)
    return NextResponse.redirect(new URL('/auth/login?error=google_callback', req.url))
  }
}


