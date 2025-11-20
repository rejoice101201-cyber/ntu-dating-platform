'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Link from 'next/link'

interface Match {
  id: string
  user: {
    id: string
    name: string
    photos?: Array<{ url: string; blurLevel?: number }>
  }
  unlockProgress?: {
    unlockLevel: number
    qaCompleted: number
  }
  matchedAt: string
  createdAt?: string
  lastMessage?: {
    content: string
    createdAt: string
  }
}

export default function MatchesPage() {
  const router = useRouter()
  const { token } = useAuthStore()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (!token && !storedToken) {
        router.push('/auth/login')
        return
      }
      if (token || storedToken) {
        await loadMatches()
      }
    }
    checkAuth()
  }, [token, router])

  const loadMatches = async () => {
    try {
      const response = await api.get('/matches')
      console.log('Matches response:', response.data)
      if (response.data && response.data.matches) {
        setMatches(response.data.matches)
      } else {
        setMatches([])
      }
    } catch (error: any) {
      console.error('Failed to load matches:', error)
      if (error.response?.status === 401) {
        // Token expired, redirect to login
        router.push('/auth/login')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>載入中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold px-4 mb-4">🐕 我的配對</h1>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">還沒有配對，去探索一下吧！</p>
            <Link
              href="/discover"
              className="mt-4 inline-block bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600"
            >
              開始探索
            </Link>
          </div>
        ) : (
          <div className="space-y-2 px-4">
            {matches.map((match) => (
              <Link
                key={match.id}
                href={`/chat/${match.id}`}
                className="block bg-white rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 relative">
                    {match.user?.photos && match.user.photos.length > 0 && match.user.photos[0]?.url ? (
                      <img
                        src={match.user.photos[0].url}
                        alt={match.user.name}
                        className="w-full h-full object-cover"
                        style={{
                          filter: `blur(${match.user.photos[0].blurLevel || 90}px)`,
                        }}
                        onError={(e) => {
                          const photoUrl = match.user?.photos?.[0]?.url;
                          console.error('Failed to load image:', photoUrl || 'unknown');
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 text-xs">
                        {match.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{match.user.name}</h3>
                    {match.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {match.lastMessage.content}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(match.matchedAt).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

