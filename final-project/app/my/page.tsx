'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

interface Post {
  id: string
  content: string
  imageUrl: string | null
  type: 'FREE' | 'TOPIC'
  topic?: {
    id: string
    title: string
  } | null
  createdAt: string
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

export default function MyPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!storedToken) {
        router.push('/auth/login')
        return
      }
    }
    loadMyPosts()
  }, [token, router])

  const loadMyPosts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/posts?authorId=' + user?.id)
      setPosts(response.data.posts || [])
    } catch (error: any) {
      console.error('Failed to load my posts:', error)
      if (error.response?.status === 401) {
        router.push('/auth/login')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-700">
          <div className="text-4xl mb-4">🐕</div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto pt-8 px-4 space-y-4">
        <h1 className="text-xl font-bold uppercase tracking-wide text-[var(--pixel-text)] mb-6">My Posts</h1>

        {posts.length === 0 ? (
          <div className="pixel-panel p-8 text-center">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-sm uppercase tracking-wide text-[var(--pixel-text-dim)] mb-2">尚無貼文</p>
            <p className="text-xs text-[var(--pixel-text-dim)]">你還沒有發表任何貼文</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="pixel-panel p-4 space-y-3"
              >
                {/* Topic Badge */}
                {post.type === 'TOPIC' && post.topic && (
                  <div className="px-3 py-1 bg-[var(--pixel-highlight)] text-white text-xs font-bold border-3 border-[var(--pixel-border)] inline-block mb-2">
                    📌 {post.topic.title}
                  </div>
                )}

                {/* Content */}
                <div className="text-[var(--pixel-text)] whitespace-pre-wrap break-words">
                  {post.content}
                </div>

                {/* Image */}
                {post.imageUrl && (
                  <div className="mt-3 rounded-none overflow-hidden border-3 border-[var(--pixel-border)]">
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {/* Time */}
                <div className="text-xs text-[var(--pixel-text-dim)]">
                  {formatTimeAgo(post.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
