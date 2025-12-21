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
        // 后端已经返回了完整的数据（包括 photos 和 unlockProgress）
        // 不需要再调用 /users/:id API
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
        <p className="text-gray-700">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-xl font-bold uppercase tracking-wide text-center mb-6">Matches</h1>

        {matches.length === 0 ? (
          <div className="text-center py-12 pixel-panel">
            <div className="text-5xl mb-3">🐾</div>
            <p className="text-sm uppercase tracking-wide text-[var(--pixel-text-dim)] mb-2">No matches yet</p>
            <p className="text-xs text-[var(--pixel-text-dim)] mb-4">Try discovering more people</p>
            <Link href="/discover" className="inline-block">
              <button className="bg-[var(--pixel-highlight)] text-white border-3 border-[var(--pixel-border)] shadow-[4px_4px_0_rgba(0,0,0,0.25)] px-6 py-2">
                Discover
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <Link
                key={match.id}
                href={`/chat/${match.id}`}
                className="block pixel-panel p-4 hover:translate-y-[-2px] transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-none overflow-hidden flex-shrink-0 border-3 border-[var(--pixel-border)] bg-[var(--pixel-surface)]">
                    {(() => {
                      if (!match.user?.photos || match.user.photos.length === 0) {
                        return (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[var(--pixel-text)]">
                            {match.user?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )
                      }

                      const coverPhoto = match.user.photos.find((p: any) => p.isCover) || match.user.photos[0]
                      const photoUrl = coverPhoto?.url
                      const blurLevel = coverPhoto?.blurLevel ?? 20

                      if (!photoUrl) {
                        return (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[var(--pixel-text)]">
                            {match.user?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )
                      }

                      return (
                        <div
                          className="w-full h-full"
                          style={{
                            filter: `blur(${blurLevel}px)`,
                            backgroundImage: `url(${photoUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                      )
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate text-[var(--pixel-text)]">{match.user.name}</h3>
                    {match.lastMessage && (
                      <p className="text-sm text-[var(--pixel-text-dim)] truncate mt-1">
                        {match.lastMessage.content}
                      </p>
                    )}
                    <p className="text-xs text-[var(--pixel-text-dim)] mt-2 flex items-center gap-2">
                      <span>🗓</span>
                      {(() => {
                        const dateToShow = match.matchedAt || match.createdAt
                        if (dateToShow) {
                          const date = new Date(dateToShow)
                          const timestamp = date.getTime()
                          if (timestamp > 0 && !isNaN(timestamp) && timestamp > 86400000) {
                            return date.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          }
                        }
                        return 'Matching'
                      })()}
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

