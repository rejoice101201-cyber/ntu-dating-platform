'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function Home() {
  const router = useRouter()
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (token && user) {
      router.push('/discover')
    } else {
      router.push('/auth/login')
    }
  }, [token, user, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🐕 NTU Dating Platform</h1>
        <p className="text-gray-600">載入中...</p>
      </div>
    </div>
  )
}

