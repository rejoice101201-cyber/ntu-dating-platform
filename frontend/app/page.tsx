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
    
    // Check localStorage directly as fallback
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    if (token && user) {
      router.push('/discover')
    } else if (storedToken) {
      // Token exists but user not loaded yet, wait a bit
      setTimeout(() => {
        const currentToken = useAuthStore.getState().token
        const currentUser = useAuthStore.getState().user
        if (currentToken && currentUser) {
          router.push('/discover')
        } else {
          router.push('/auth/login')
        }
      }, 100)
    } else {
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

