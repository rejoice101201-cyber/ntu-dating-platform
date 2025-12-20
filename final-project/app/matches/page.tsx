'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Link from 'next/link'
import Toast from '@/components/Toast'
import { useUnreadMessages } from '@/components/hooks/useUnreadMessages'
import Pusher from 'pusher-js'

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

interface PendingMatch {
  id: string
  fromUser: {
    id: string
    name: string
    photo: string | null
  }
  createdAt: string
}

export default function MatchesPage() {
  const router = useRouter()
  const { token, user } = useAuthStore()
  const [matches, setMatches] = useState<Match[]>([])
  const [pendingMatches, setPendingMatches] = useState<PendingMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [processingMatch, setProcessingMatch] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const { getUnreadCount } = useUnreadMessages()
  const pusherRef = useRef<Pusher | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (!token && !storedToken) {
        router.push('/auth/login')
        return
      }
      if (token || storedToken) {
        await Promise.all([loadMatches(), loadPendingMatches()])
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
              console.log(`Loaded profile for ${match.user.name}:`, {
                userId: match.user.id,
                photos: profileResponse.data.photos,
                photosCount: profileResponse.data.photos?.length || 0,
                unlockProgress: profileResponse.data.unlockProgress,
              })
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
        console.log('Final matches with profiles:', matchesWithProfiles.map((m: any) => ({
          name: m.user.name,
          photosCount: m.user.photos?.length || 0,
          firstPhoto: m.user.photos?.[0],
        })))
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

  // 监听新消息，自动刷新 matches 列表以更新排序
  useEffect(() => {
    if (!token || !user?.id) return

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2'

    if (pusherKey && pusherCluster) {
      try {
        const pusher = new Pusher(pusherKey, {
          cluster: pusherCluster,
        })

        // 订阅用户频道，监听新消息
        const channel = pusher.subscribe(`user-${user.id}`)
        
        // 当收到新消息时，重新加载 matches 以更新排序
        channel.bind('new_message', (message: any) => {
          if (message.senderId !== user.id && message.matchId) {
            // 延迟一下，确保后端已经更新了消息
            setTimeout(() => {
              loadMatches()
            }, 500)
          }
        })

        pusherRef.current = pusher

        return () => {
          pusher.disconnect()
        }
      } catch (error) {
        console.error('Failed to initialize Pusher for matches page:', error)
      }
    }
  }, [token, user?.id, loadMatches])

  const loadPendingMatches = async () => {
    try {
      const response = await api.get('/notifications/pending-matches')
      setPendingMatches(response.data.pendingMatches || [])
    } catch (error: any) {
      console.error('Failed to load pending matches:', error)
      setPendingMatches([])
    }
  }

  const handleAcceptMatch = async (matchId: string) => {
    setProcessingMatch(matchId)
    try {
      const response = await api.post(`/matches/${matchId}/accept`)
      if (response.data.success) {
        setToast({ message: '配對成功！現在可以開始聊天了！', type: 'success' })
        // 重新載入
        await Promise.all([loadMatches(), loadPendingMatches()])
      }
    } catch (error: any) {
      console.error('Failed to accept match:', error)
      setToast({ message: error.response?.data?.error || '接受配對失敗', type: 'error' })
    } finally {
      setProcessingMatch(null)
    }
  }

  const handleRejectMatch = async (matchId: string) => {
    setProcessingMatch(matchId)
    try {
      const response = await api.post(`/matches/${matchId}/reject`)
      if (response.data.success) {
        setToast({ message: '已拒絕配對請求', type: 'info' })
        // 重新載入
        await loadPendingMatches()
      }
    } catch (error: any) {
      console.error('Failed to reject match:', error)
      setToast({ message: error.response?.data?.error || '拒絕配對失敗', type: 'error' })
    } finally {
      setProcessingMatch(null)
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
    <div className="min-h-screen pb-24">
      {/* Toast 通知 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-xl font-bold uppercase tracking-wide text-center mb-6">Matches</h1>

        {/* 待處理的配對請求 */}
        {pendingMatches.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm uppercase tracking-wide text-[var(--pixel-text-dim)] mb-3">
              待處理的配對請求 ({pendingMatches.length})
            </h2>
            <div className="space-y-3">
              {pendingMatches.map((pending) => (
                <div
                  key={pending.id}
                  className="pixel-panel p-4"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--pixel-surface)] border-3 border-[var(--pixel-border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {pending.fromUser.photo ? (
                        <img
                          src={pending.fromUser.photo}
                          alt={pending.fromUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-[var(--pixel-text)]">
                          {pending.fromUser.name[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[var(--pixel-text)] truncate">
                        {pending.fromUser.name}
                      </h3>
                      <p className="text-xs text-[var(--pixel-text-dim)]">
                        想要與你配對
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptMatch(pending.id)}
                      disabled={processingMatch === pending.id}
                      className="flex-1 px-4 py-2 bg-[var(--pixel-highlight)] text-white text-sm font-bold border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingMatch === pending.id ? '處理中...' : '接受'}
                    </button>
                    <button
                      onClick={() => handleRejectMatch(pending.id)}
                      disabled={processingMatch === pending.id}
                      className="flex-1 px-4 py-2 bg-[var(--pixel-text-dim)] text-white text-sm font-bold border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      拒絕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 已配對的列表 */}
        <div>
          <h2 className="text-sm uppercase tracking-wide text-[var(--pixel-text-dim)] mb-3">
            已配對 ({matches.length})
          </h2>
        </div>

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
            {matches.map((match) => {
              const unreadCount = getUnreadCount(match.id)
              
              return (
                <Link
                  key={match.id}
                  href={`/chat/${match.id}`}
                  className="block pixel-panel p-4 hover:translate-y-[-2px] transition-transform relative"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-none overflow-hidden flex-shrink-0 border-3 border-[var(--pixel-border)] bg-[var(--pixel-surface)] relative">
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
                      {/* 未读消息徽章 */}
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold border-2 border-white rounded-full flex items-center justify-center shadow-[2px_2px_0_rgba(0,0,0,0.25)] z-10">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

