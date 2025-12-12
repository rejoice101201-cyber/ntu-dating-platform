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
  const [gisReady, setGisReady] = useState(false)

  useEffect(() => {
    // 動態載入 Google Identity Services
    if (typeof window === 'undefined') return
    if (document.getElementById('google-oauth-script')) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.id = 'google-oauth-script'
    script.onload = () => {
      setGisReady(true)
      // 預先初始化，避免按鈕點擊時才初始化導致延遲
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: () => {},
          ux_mode: 'popup',
          use_fedcm_for_prompt: false,
        })
        // 渲染隱藏按鈕，部分瀏覽器需有 renderButton 觸發權限
        const btnContainer = document.getElementById('google-btn-slot')
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, { theme: 'outline', size: 'large' })
        }
      }
    }
    script.onerror = () => setError('無法載入 Google 登入腳本，請稍後再試')
    document.body.appendChild(script)
  }, [])

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

  const handleGoogle = async () => {
    if (typeof window === 'undefined' || !window.google || !window.google.accounts?.id) {
      setError('Google 登入初始化中，請稍後再試')
      return
    }
    setError('')
    setGLoading(true)
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        try {
          const credential = response?.credential
          if (!credential) {
            throw new Error('未取得 Google 憑證')
          }
          await loginWithGoogle(credential)
          setTimeout(() => router.push('/discover'), 100)
        } catch (err: any) {
          setError(err.response?.data?.error || err.message || 'Google 登入失敗')
          setGLoading(false)
        }
      },
      ux_mode: 'popup',
      use_fedcm_for_prompt: false,
    })
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        setError('Google 登入被阻擋，請允許第三方 Cookie 或改用無痕/桌面再試')
        setGLoading(false)
      } else if (notification.isSkippedMoment()) {
        setError('Google 登入被瀏覽器跳過，請重新點擊或改用無痕/桌面')
        setGLoading(false)
      } else if (notification.isDismissedMoment()) {
        setGLoading(false)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border-4 border-pink-200">
        <div className="text-center mb-8">
          <h1 className="text-6xl mb-3 animate-bounce">🐕</h1>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">歡迎回來</h2>
          <p className="text-pink-600 mt-3 text-lg font-semibold">登入你的帳戶</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email 或 userID（userID 可免密碼）
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="your@gmail.com 或 yourUserID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密碼（使用 userID 可留空）
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white py-4 rounded-full font-bold text-lg hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? '登入中... 🐾' : '✨ 登入 ✨'}
          </button>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={gLoading}
            className="w-full border border-pink-300 text-pink-600 py-3 rounded-full font-semibold hover:bg-pink-50 disabled:opacity-50 transition-all"
          >
            {gLoading ? 'Google 登入中...' : '使用 Google 登入'}
          </button>
          <div id="google-btn-slot" className="hidden" aria-hidden="true" />
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          還沒有帳戶？{' '}
          <Link href="/auth/register" className="text-primary-500 hover:underline">
            註冊
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          忘記密碼？{' '}
          <Link href="/auth/forgot" className="text-primary-500 hover:underline">
            重設密碼
          </Link>
        </p>
      </div>
    </div>
  )
}

