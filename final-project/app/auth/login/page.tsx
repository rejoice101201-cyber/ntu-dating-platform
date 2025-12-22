'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

declare global {
  interface Window {
    google: any
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '509318580080-2kko35m08jd0icaa4143mrcl7cgl9o5a.apps.googleusercontent.com'

// 錯誤訊息映射
const errorMessages: Record<string, string> = {
  database_connection_failed: 'Database connection failed. Please try again later.',
  google_hd_not_allowed: '僅限臺大 Google 帳號登入',
  google_no_email: 'Google 帳號未提供 Email',
  missing_code: 'Google 登入授權碼缺失',
  missing_id_token: 'Google ID Token 缺失',
  inactive: '帳號已停用',
  google_callback: 'Google 登入失敗，請稍後再試',
}

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore((state) => state.login)
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)

  // 檢查 URL 參數中的錯誤訊息
  useEffect(() => {
    if (typeof window === 'undefined') return
    const errorParam = searchParams?.get('error')
    const descriptionParam = searchParams?.get('description')
    
    if (errorParam) {
      const errorMsg = errorMessages[errorParam] || descriptionParam || '登入失敗，請稍後再試'
      setError(errorMsg)
      // 清除 URL 參數
      router.replace('/auth/login', { scroll: false })
    }
  }, [searchParams, router])

  useEffect(() => {
    // 若 10 分鐘內已經成功登入過，直接進站
    if (typeof window !== 'undefined') {
      const expires = localStorage.getItem('recentLoginExpiresAt')
      const token = localStorage.getItem('token')
      if (token && expires && Number(expires) > Date.now()) {
        router.replace('/discover')
        return
      }
    }

    if (typeof window === 'undefined') return
    const hash = window.location.hash || ''
    if (!hash.includes('id_token')) return
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const idToken = params.get('id_token')
    if (!idToken) return
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
      await login(email, password)
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
    const redirectUri = `${window.location.origin}/api/auth/google/callback`
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    url.searchParams.set('client_id', GOOGLE_CLIENT_ID)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid email profile')
    url.searchParams.set('prompt', 'select_account')
    window.location.href = url.toString()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="pixel-panel p-10 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🐕</div>
          <h2 className="text-2xl font-bold text">Shibuya</h2>
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="pixel-panel p-10 w-full max-w-md text-center">
          <div className="text-5xl mb-3">🐕</div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginInner />
    </Suspense>
  )
}

