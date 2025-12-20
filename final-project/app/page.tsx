'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function Home() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [isHydrated, setIsHydrated] = useState(false)

  // Wait for Zustand persist to rehydrate
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return // Wait for hydration
    
    // Only redirect if we have both token and user (validated state)
    if (token && user) {
      router.push('/discover')
      return
    }
    
    // If no token or user, go to login
    // Don't check localStorage here to avoid loops - let auth store handle rehydration
    if (!token || !user) {
      router.push('/auth/login')
    }
  }, [token, user, router, isHydrated])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🐕 NTU Dating Platform</h1>
        <p className="text-gray-600">載入中...</p>
      </div>
    </div>
  )
}

