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
        // Load full profile for each user to get correct blur levels
        const matchesWithProfiles = await Promise.all(
          response.data.matches.map(async (match: any) => {
            try {
              // Load full user profile to get photos with correct blur levels
              const profileResponse = await api.get(`/users/${match.user.id}`)
              return {
                ...match,
                user: {
                  ...match.user,
                  photos: profileResponse.data.photos || [],
                },
                unlockProgress: profileResponse.data.unlockProgress,
              }
            } catch (error) {
              console.error(`Failed to load profile for user ${match.user.id}:`, error)
              return match // Fallback to original match data
            }
          })
        )
        setMatches(matchesWithProfiles)
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold px-4 mb-6 text-center">
          <span className="text-4xl">🐕</span>
          <span className="ml-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">我的配對</span>
        </h1>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐾</div>
            <p className="text-pink-600 text-lg font-semibold mb-2">還沒有配對</p>
            <p className="text-gray-600 mb-6">去探索一下吧！</p>
            <Link
              href="/discover"
              className="mt-4 inline-block bg-gradient-to-r from-pink-400 to-purple-400 text-white px-8 py-3 rounded-full hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl font-bold text-lg"
            >
              🎈 開始探索
            </Link>
          </div>
        ) : (
          <div className="space-y-3 px-4">
            {matches.map((match) => (
              <Link
                key={match.id}
                href={`/chat/${match.id}`}
                className="block bg-white rounded-2xl p-4 hover:shadow-lg transition-all border-2 border-pink-100 hover:border-pink-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-pink-100 rounded-full overflow-hidden flex-shrink-0 relative">
                    {match.user?.photos && match.user.photos.length > 0 ? (
                      (() => {
                        // Find cover photo or first photo
                        const coverPhoto = match.user.photos.find((p: any) => p.isCover) || match.user.photos[0]
                        const photoUrl = coverPhoto?.url
                        const blurLevel = coverPhoto?.blurLevel ?? 20
                        
                        if (!photoUrl) {
                          console.error('No photo URL found:', { match, coverPhoto, photos: match.user.photos })
                          return (
                            <div className="w-full h-full flex items-center justify-center bg-pink-200 text-pink-600 text-xs font-bold">
                              {match.user?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )
                        }
                        
                        return (
                          <div
                            className="w-full h-full rounded-full"
                            style={{
                              filter: `blur(${blurLevel}px)`,
                              backgroundImage: `url(${photoUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                        )
                      })()
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-pink-200 text-pink-600 text-xs font-bold">
                        {match.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate text-pink-700">{match.user.name}</h3>
                    {match.lastMessage && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {match.lastMessage.content}
                      </p>
                    )}
                    <p className="text-xs text-pink-400 mt-2 flex items-center gap-1">
                      <span>💕</span>
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

