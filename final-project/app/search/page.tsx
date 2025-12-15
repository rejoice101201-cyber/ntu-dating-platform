'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'

export default function SearchPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (!token) {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!storedToken) {
        router.push('/auth/login')
        return
      }
    }
  }, [token, router])

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto pt-8 px-4">
        <h1 className="text-xl font-bold uppercase tracking-wide text-[var(--pixel-text)] mb-6">Search</h1>
        <div className="pixel-panel p-8 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-sm uppercase tracking-wide text-[var(--pixel-text-dim)] mb-2">搜尋功能開發中</p>
          <p className="text-xs text-[var(--pixel-text-dim)]">Coming Soon...</p>
        </div>
      </div>
    </div>
  )
}
