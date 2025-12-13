'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'

declare global {
  interface Window {
    google: any
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '509318580080-2kko35m08jd0icaa4143mrcl7cgl9o5a.apps.googleusercontent.com'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash || ''
    if (!hash.includes('id_token')) return
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const idToken = params.get('id_token')
    if (!idToken) return
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/auth/login/page.tsx:hash',message:'hash contains id_token, start loginWithGoogle',data:{hasIdToken:true,hashLength:hash.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    setGLoading(true)
    setError('')
    // 清掉 hash
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
    ;(async () => {
      try {
        await loginWithGoogle(idToken)
        setTimeout(() => router.push('/discover'), 100)
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Google 登入失敗')
      } finally {
        setGLoading(false)
      }
    })()
  }, [loginWithGoogle, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(identifier, password || undefined)
      // Wait a bit for state to update
      setTimeout(() => {
        router.push('/discover')
      }, 100)
    } catch (err: any) {
      setError(err.response?.data?.error || '登入失敗')
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    if (typeof window === 'undefined') return
    setError('')
    setGLoading(true)
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    url.searchParams.set('client_id', GOOGLE_CLIENT_ID)
    url.searchParams.set('redirect_uri', `${window.location.origin}/api/auth/google/callback`)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid email profile')
    url.searchParams.set('prompt', 'select_account')
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/auth/login/page.tsx:handleGoogle',message:'start google redirect',data:{redirect:url.toString(),origin:window.location.origin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    window.location.href = url.toString()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="pixel-panel p-10 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🐕</div>
          <h2 className="text-2xl font-bold text">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 border-3 border-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
              Email or UserID (UserID can skip password)
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              className="w-full"
              placeholder="your@email.com or yourUserID"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
              Password (optional if using UserID)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Enter'}
          </button>

          <button type="button" onClick={handleGoogle} disabled={gLoading} className="w-full bg-[var(--pixel-panel)] text-[var(--pixel-border)] hover:bg-[var(--pixel-highlight)] hover:text-white">
            {gLoading ? 'Connecting Google...' : 'Sign in with Google'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-700">
          Need an account?{' '}
          <Link href="/auth/register" className="underline">
            Register
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-gray-700">
          Forgot password?{' '}
          <Link href="/auth/forgot" className="underline">
            Reset
          </Link>
        </p>
      </div>
    </div>
  )
}

