import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'

// This route is inherently dynamic (uses searchParams and remote token exchange)
export const dynamic = 'force-dynamic'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''

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

    // 將 id_token 帶回登入頁，由前端既有流程處理
    const loginUrl = new URL('/auth/login', req.nextUrl.origin)
    loginUrl.hash = `id_token=${encodeURIComponent(tokens.id_token)}`
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/google/callback/route.ts:redirect',message:'redirect with id_token hash',data:{loginUrl:loginUrl.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{})
    // #endregion
    return NextResponse.redirect(loginUrl)
  } catch (error) {
    console.error('[Google Callback] error:', error)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/google/callback/route.ts:catch',message:'callback error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{})
    // #endregion
    return NextResponse.redirect(new URL('/auth/login?error=google_callback', req.url))
  }
}


