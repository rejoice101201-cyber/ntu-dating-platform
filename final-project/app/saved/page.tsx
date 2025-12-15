'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Link from 'next/link'
import Toast from '@/components/Toast'

interface Post {
  id: string
  authorId: string
  author: {
    id: string
    name: string | null
  }
  content: string
  imageUrl: string | null
  type: 'FREE' | 'TOPIC'
  topic?: { id: string; title: string } | null
  board?: { id: string; title: string } | null
  createdAt: string
}

interface Favorite {
  id: string
  postId: string
  createdAt: string
  post: Post | null
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '剛剛'
  if (diffMins < 60) return `${diffMins} 分鐘前`
  if (diffHours < 24) return `${diffHours} 小時前`
  if (diffDays < 7) return `${diffDays} 天前`
  return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
}

export default function SavedPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    if (!token) {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!storedToken) {
        router.push('/auth/login')
        return
      }
    }
    loadFavorites()
  }, [token, router])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get('/favorites')
      setFavorites(res.data.favorites || [])
    } catch (err: any) {
      console.error('Failed to load favorites', err)
      setError(err.response?.data?.error || '載入收藏失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleUnfavorite = async (postId: string) => {
    try {
      await api.delete(`/favorites/${postId}`)
      setFavorites((prev) => prev.filter((f) => f.postId !== postId))
      setToast({ message: '已取消收藏', type: 'info' })
    } catch (err: any) {
      console.error('Unfavorite failed', err)
      setToast({ message: err.response?.data?.error || '取消收藏失敗', type: 'error' })
    }
  }

  const handleMatchFromPost = async (postId: string) => {
    try {
      const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null)
      if (!currentToken) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/posts/${postId}/match`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '配對失敗' }))
        throw new Error(errorData.error || '配對失敗')
      }

      const data = await response.json()

      if (data.match.matched) {
        setToast({ message: '配對成功！現在可以開始聊天了！', type: 'success' })
      } else if (data.match.pending) {
        setToast({ message: '已發送配對請求！等待對方回應...', type: 'info' })
      } else if (data.match.alreadyMatched) {
        setToast({ message: '你們已經配對了！', type: 'info' })
      }
    } catch (err: any) {
      console.error('Match from saved failed', err)
      setToast({ message: err.message || '配對失敗，請稍後再試', type: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-700">
          <div className="text-4xl mb-4">⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-2xl mx-auto pt-8 px-4 space-y-4">
        <h1 className="text-xl font-bold uppercase tracking-wide text-[var(--pixel-text)] mb-2">Saved</h1>
        <p className="text-xs text-[var(--pixel-text-dim)] mb-4">
          收藏你在 Wall 上喜歡的貼文，隨時回來這裡複習。
        </p>

        {error && (
          <div className="pixel-panel p-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="pixel-panel p-8 text-center">
            <div className="text-5xl mb-4">❤️</div>
            <p className="text-sm uppercase tracking-wide text-[var(--pixel-text-dim)] mb-2">尚無收藏</p>
            <p className="text-xs text-[var(--pixel-text-dim)]">
              在 Wall 看到喜歡的內容時，點一下貼文右上角的 ❤️ 就可以收藏到這裡。
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((fav) =>
              fav.post ? (
                <div key={fav.id} className="pixel-panel p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--pixel-surface)] border-3 border-[var(--pixel-border)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[var(--pixel-text)]">
                        {fav.post.author.name ? fav.post.author.name[0]?.toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[var(--pixel-text)] truncate">
                        {fav.post.author.name || '????'}
                      </div>
                      <div className="text-xs text-[var(--pixel-text-dim)]">
                        {formatTimeAgo(fav.post.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUnfavorite(fav.postId)}
                        className="px-1"
                        aria-label="取消收藏"
                      >
                        <span className="text-red-500">❤️</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMatchFromPost(fav.postId)}
                        className="px-3 py-1 bg-[var(--pixel-highlight-2)] text-white text-xs font-bold border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.25)] transition-all"
                      >
                        想要配對
                      </button>
                    </div>
                  </div>

                  {fav.post.board && (
                    <Link
                      href={`/topics/${fav.post.board.id}`}
                      className="px-3 py-1 bg-[var(--pixel-panel)] text-[var(--pixel-text)] text-xs font-bold border-3 border-[var(--pixel-border)] inline-block mb-2 hover:bg-[var(--pixel-surface)]"
                    >
                      📌 主題：{fav.post.board.title}
                    </Link>
                  )}
                  {fav.post.type === 'TOPIC' && fav.post.topic && (
                    <div className="px-3 py-1 bg-[var(--pixel-highlight)] text-white text-xs font-bold border-3 border-[var(--pixel-border)] inline-block mb-2">
                      📌 {fav.post.topic.title}
                    </div>
                  )}

                  <div className="text-[var(--pixel-text)] whitespace-pre-wrap break-words">
                    {fav.post.content}
                  </div>

                  {fav.post.imageUrl && (
                    <div className="mt-3 rounded-none overflow-hidden border-3 border-[var(--pixel-border)]">
                      <img
                        src={fav.post.imageUrl}
                        alt="Post"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div key={fav.id} className="pixel-panel p-4 text-xs text-[var(--pixel-text-dim)] flex items-center justify-between">
                  <span>此貼文已被刪除</span>
                  <button
                    type="button"
                    onClick={() => handleUnfavorite(fav.postId)}
                    className="px-3 py-1 bg-[var(--pixel-panel)] border-3 border-[var(--pixel-border)] text-[var(--pixel-text)] text-xs font-bold hover:bg-[var(--pixel-surface)]"
                  >
                    移除收藏
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
