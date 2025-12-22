'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Link from 'next/link'

interface Match {
  id: string
  status: 'matched' | 'pending'
  isPending?: boolean
  isSentByMe?: boolean // 是否是我發送的配對請求
  isReceivedByMe?: boolean // 是否是別人發送給我的配對請求
  user: {
    id: string
    name: string
    photos?: Array<{ url: string; blurLevel?: number }>
  }
  unlockProgress?: {
    unlockLevel: number
    qaCompleted: number
  }
  matchedAt?: string
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
  const [processingMatchId, setProcessingMatchId] = useState<string | null>(null)

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

  const handleAcceptMatch = async (matchId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setProcessingMatchId(matchId)
    try {
      const response = await api.post(`/matches/${matchId}/accept`)
      if (response.data.success) {
        await loadMatches() // 重新載入配對列表
      }
    } catch (error: any) {
      console.error('Failed to accept match:', error)
      alert(error.response?.data?.error || '接受配對請求失敗')
    } finally {
      setProcessingMatchId(null)
    }
  }

  const handleRejectMatch = async (matchId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('確定要拒絕這個配對請求嗎？')) {
      return
    }
    
    setProcessingMatchId(matchId)
    try {
      const response = await api.post(`/matches/${matchId}/reject`)
      if (response.data.success) {
        await loadMatches() // 重新載入配對列表
      }
    } catch (error: any) {
      console.error('Failed to reject match:', error)
      alert(error.response?.data?.error || '拒絕配對請求失敗')
    } finally {
      setProcessingMatchId(null)
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
    <div className="min-h-screen pl-20 pb-24">
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
            {matches.map((match) => {
              const isPending = match.isPending || match.status === 'pending'
              const isReceivedByMe = match.isReceivedByMe // 別人發送給我的配對請求
              const isSentByMe = match.isSentByMe // 我發送的配對請求
              
              return (
                <div
                  key={match.id}
                  className="pixel-panel p-4 hover:translate-y-[-2px] transition-transform"
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
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-lg truncate text-[var(--pixel-text)]">{match.user.name}</h3>
                        {isPending && (
                          <span className="px-2 py-1 bg-[var(--pixel-highlight-2)] text-white text-xs font-bold border-2 border-[var(--pixel-border)] whitespace-nowrap">
                            {isReceivedByMe ? '待處理' : '等待回應'}
                          </span>
                        )}
                      </div>
                      {match.lastMessage && (
                        <p className="text-sm text-[var(--pixel-text-dim)] truncate mt-1">
                          {match.lastMessage.content}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-[var(--pixel-text-dim)] flex items-center gap-2">
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
                        {isPending && isReceivedByMe && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleAcceptMatch(match.id, e)}
                              disabled={processingMatchId === match.id}
                              className="px-3 py-1 bg-[var(--pixel-highlight)] text-white text-xs font-bold border-2 border-[var(--pixel-border)] shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:shadow-[1px_1px_0_rgba(0,0,0,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingMatchId === match.id ? '處理中...' : '接受'}
                            </button>
                            <button
                              onClick={(e) => handleRejectMatch(match.id, e)}
                              disabled={processingMatchId === match.id}
                              className="px-3 py-1 bg-[var(--pixel-text-dim)] text-white text-xs font-bold border-2 border-[var(--pixel-border)] shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:shadow-[1px_1px_0_rgba(0,0,0,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              拒絕
                            </button>
                          </div>
                        )}
                        {!isPending && (
                          <Link
                            href={`/chat/${match.id}`}
                            className="px-3 py-1 bg-[var(--pixel-highlight)] text-white text-xs font-bold border-2 border-[var(--pixel-border)] shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:shadow-[1px_1px_0_rgba(0,0,0,0.25)] transition-all"
                          >
                            聊天
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

