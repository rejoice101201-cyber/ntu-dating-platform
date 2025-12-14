'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export default function NotificationBadge() {
  const { token } = useAuthStore()
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setPendingCount(0)
      setLoading(false)
      return
    }

    loadPendingMatches()

    // 每 30 秒輪詢一次
    const interval = setInterval(() => {
      loadPendingMatches()
    }, 30000)

    return () => clearInterval(interval)
  }, [token])

  const loadPendingMatches = async () => {
    try {
      const response = await api.get('/notifications/pending-matches')
      setPendingCount(response.data.count || 0)
    } catch (error) {
      console.error('Failed to load pending matches:', error)
      setPendingCount(0)
    } finally {
      setLoading(false)
    }
  }

  if (loading || pendingCount === 0) return null

  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold border-2 border-white rounded-full flex items-center justify-center shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
      {pendingCount > 9 ? '9+' : pendingCount}
    </span>
  )
}
