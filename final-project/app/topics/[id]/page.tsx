'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
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
  topicId?: string | null
  topic?: { id: string; title: string } | null
  boardId?: string | null
  board?: { id: string; title: string } | null
  createdAt: string
  isFavorited?: boolean
  likeCount: number
  hasLiked: boolean
}

interface TopicDetail {
  id: string
  title: string
  postCount?: number
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

export default function TopicPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuthStore()
  const topicId = params?.id as string

  const [topic, setTopic] = useState<TopicDetail | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
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
    if (topicId) {
      loadTopic()
      loadPosts()
    }
  }, [token, topicId, router])

  const loadTopic = async () => {
    try {
      const res = await api.get(`/topics/${topicId}`)
      setTopic(res.data.topic)
    } catch (err: any) {
      console.error('Failed to load topic', err)
      setError(err.response?.data?.error || '載入主題失敗')
    }
  }

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get(`/posts?boardId=${topicId}`)
      setPosts(res.data.posts || [])
    } catch (err: any) {
      console.error('Failed to load posts', err)
      setError(err.response?.data?.error || '載入貼文失敗')
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, isFavorited: !p.isFavorited } : p
      )
    )
    try {
      const target = posts.find((p) => p.id === postId)
      if (!target?.isFavorited) {
        await api.post('/favorites', { postId })
        setToast({ message: '已加入收藏', type: 'success' })
      } else {
        await api.delete(`/favorites/${postId}`)
        setToast({ message: '已取消收藏', type: 'info' })
      }
    } catch (err: any) {
      console.error('Toggle favorite failed:', err)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isFavorited: !p.isFavorited } : p
        )
      )
      setToast({ message: err.response?.data?.error || '更新收藏狀態失敗', type: 'error' })
    }
  }

  const toggleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              hasLiked: !p.hasLiked,
              likeCount: p.likeCount + (p.hasLiked ? -1 : 1),
            }
          : p
      )
    )
    try {
      const res = await api.post(`/posts/${postId}/like`)
      const { likeCount, hasLiked } = res.data
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likeCount, hasLiked } : p
        )
      )
    } catch (err: any) {
      console.error('Toggle like failed:', err)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                hasLiked: !p.hasLiked,
                likeCount: p.likeCount + (p.hasLiked ? 1 : -1),
              }
            : p
        )
      )
      setToast({ message: err.response?.data?.error || '更新按讚狀態失敗', type: 'error' })
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-700">
          <div className="text-4xl mb-4">
            ⏳
          </div>
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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold uppercase tracking-wide text-[var(--pixel-text)]">
            {topic ? topic.title : '主題'}
          </h1>
          {topic?.postCount !== undefined && (
            <span className="text-xs text-[var(--pixel-text-dim)]">{topic.postCount} 則貼文</span>
          )}
        </div>

        {error && (
          <div className="pixel-panel p-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="pixel-panel p-8 text-center">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-sm uppercase tracking-wide text-[var(--pixel-text-dim)] mb-2">尚無貼文</p>
            <p className="text-xs text-[var(--pixel-text-dim)]">成為第一個分享的人！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="pixel-panel p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--pixel-surface)] border-3 border-[var(--pixel-border)] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[var(--pixel-text)]">
                      {post.author.name ? post.author.name[0]?.toUpperCase() : '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[var(--pixel-text)] truncate">
                      {post.author.name || '????'}
                      {!post.author.name && (
                        <span className="ml-2 text-xs text-[var(--pixel-text-dim)] font-normal">
                          (配對前能匿名且不顯示)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--pixel-text-dim)]">
                      {formatTimeAgo(post.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(post.id)}
                      className="px-1"
                      aria-label={post.isFavorited ? '取消收藏' : '收藏'}
                    >
                      <span className={post.isFavorited ? 'text-red-500' : 'text-[var(--pixel-text-dim)]'}>
                        {post.isFavorited ? '❤️' : '🤍'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      className="flex items-center gap-1 px-1 text-xs"
                      aria-label={post.hasLiked ? '取消按讚' : '按讚'}
                    >
                      <span className={post.hasLiked ? 'text-[var(--pixel-highlight)]' : 'text-[var(--pixel-text-dim)]'}>
                        👍
                      </span>
                      <span className="text-[var(--pixel-text-dim)]">{post.likeCount}</span>
                    </button>
                  </div>
                </div>

                {post.board && (
                  <div className="px-3 py-1 bg-[var(--pixel-panel)] text-[var(--pixel-text)] text-xs font-bold border-3 border-[var(--pixel-border)] inline-block mb-2">
                    📌 主題：{post.board.title}
                  </div>
                )}

                {post.type === 'TOPIC' && post.topic && (
                  <div className="px-3 py-1 bg-[var(--pixel-highlight)] text-white text-xs font-bold border-3 border-[var(--pixel-border)] inline-block mb-2">
                    📌 {post.topic.title}
                  </div>
                )}

                <div className="text-[var(--pixel-text)] whitespace-pre-wrap break-words">
                  {post.content}
                </div>

                {post.imageUrl && (
                  <div className="mt-3 rounded-none overflow-hidden border-3 border-[var(--pixel-border)]">
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
