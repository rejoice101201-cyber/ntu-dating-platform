'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function GoogleSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const userBase64 = searchParams.get('user')

    if (!token || !userBase64) {
      setError('Missing token')
      const t = setTimeout(() => router.replace('/auth/login?error=google_callback'), 800)
      return () => clearTimeout(t)
    }

    try {
      const userJson = Buffer.from(userBase64, 'base64').toString('utf8')
      const user = JSON.parse(userJson)
      setAuth(user, token)
      router.replace('/discover')
    } catch (e) {
      console.error('Failed to parse user from Google success:', e)
      setError('Invalid token data')
      const t = setTimeout(() => router.replace('/auth/login?error=google_callback'), 800)
      return () => clearTimeout(t)
    }
  }, [router, searchParams, setAuth])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="pixel-panel p-8 text-center space-y-3">
        <div className="text-4xl">🔐</div>
        <p className="font-bold">
          {error ? 'Redirecting…' : 'Signing in with Google…'}
        </p>
        <p className="text-sm text-gray-600">
          {error ? 'Please try again.' : 'Please wait a moment.'}
        </p>
      </div>
    </div>
  )
}

