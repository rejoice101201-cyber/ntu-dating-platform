'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export const dynamic = 'force-dynamic'

const DogLoader = ({ text }: { text: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="pixel-panel p-10 text-center space-y-4">
      <div className="w-24 h-24 mx-auto relative">
        <div className="pixel-dog" />
      </div>
      <p className="font-bold text-lg">{text}</p>
      <p className="text-sm text-gray-600">Please wait…</p>
    </div>
    <style jsx>{`
      .pixel-dog {
        width: 48px;
        height: 32px;
        background: url('/pixel-dog-sprite.png') 0 0 / auto 32px no-repeat;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: run 0.8s steps(4) infinite;
      }
      @keyframes run {
        from { background-position: 0 0; }
        to { background-position: -192px 0; }
      }
    `}</style>
  </div>
)

function SuccessInner() {
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
      // 使用瀏覽器原生的 atob() 而不是 Node.js 的 Buffer
      const userJson = typeof window !== 'undefined' 
        ? atob(userBase64) 
        : Buffer.from(userBase64, 'base64').toString('utf8')
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

  return <DogLoader text={error ? 'Redirecting…' : 'Signing in with Google…'} />
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={<DogLoader text="Signing in with Google…" />}>
      <SuccessInner />
    </Suspense>
  )
}

