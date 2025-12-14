'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

interface Post {
  id: string
  authorId: string
  author: {
    id: string
    name: string
  }
  content: string
  imageUrl: string | null
  type: 'FREE' | 'TOPIC'
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

export default function WallPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 發文狀態
  const [content, setContent] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!token) {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!storedToken) {
        router.push('/auth/login')
        return
      }
    }
    loadPosts()
  }, [token, router])

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/posts')
      setPosts(response.data.posts || [])
    } catch (error: any) {
      console.error('Failed to load posts:', error)
      if (error.response?.status === 401) {
        router.push('/auth/login')
      } else {
        setError('載入貼文失敗，請稍後再試')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      alert('請輸入貼文內容')
      return
    }

    if (posting) return

    setPosting(true)
    setError(null)

    try {
      const currentToken = token || localStorage.getItem('token')
      if (!currentToken) {
        router.push('/auth/login')
        return
      }

      const formData = new FormData()
      formData.append('content', content.trim())
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errorData.error || '發文失敗')
      }

      // 清空輸入
      setContent('')
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // 重新載入 feed
      await loadPosts()
    } catch (error: any) {
      console.error('Failed to create post:', error)
      setError(error.message || '發文失敗，請稍後再試')
    } finally {
      setPosting(false)
    }
  }

  if (loading && posts.length === 0) {
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wide text-[var(--pixel-text)]">Wall</h1>
        </div>

        {/* 發文輸入框 */}
        <div className="pixel-panel p-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="說說你的想法..."
              className="w-full min-h-[100px] p-3 bg-[var(--pixel-surface)] border-3 border-[var(--pixel-border)] text-[var(--pixel-text)] resize-none focus:outline-none focus:ring-0"
              disabled={posting}
            />
            
            {/* 圖片預覽 */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover border-3 border-[var(--pixel-border)]"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white border-3 border-[var(--pixel-border)] flex items-center justify-center font-bold hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}

            {/* 錯誤訊息 */}
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex items-center justify-between gap-3">
              <label className="cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={posting}
                />
                <span className="px-4 py-2 bg-[var(--pixel-panel)] border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] text-[var(--pixel-text)] font-bold hover:bg-[var(--pixel-surface)] transition-colors inline-block">
                  📷 選擇圖片
                </span>
              </label>
              
              <button
                type="submit"
                disabled={posting || !content.trim()}
                className="px-6 py-2 bg-[var(--pixel-highlight)] text-white border-3 border-[var(--pixel-border)] shadow-[4px_4px_0_rgba(0,0,0,0.25)] font-bold hover:shadow-[2px_2px_0_rgba(0,0,0,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? '發佈中...' : '發佈'}
              </button>
            </div>
          </form>
        </div>

        {/* Feed */}
        {posts.length === 0 ? (
          <div className="text-center py-12 pixel-panel">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-sm uppercase tracking-wide text-[var(--pixel-text-dim)] mb-2">No posts yet</p>
            <p className="text-xs text-[var(--pixel-text-dim)]">Be the first to post!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="pixel-panel p-4 space-y-3"
              >
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--pixel-surface)] border-3 border-[var(--pixel-border)] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[var(--pixel-text)]">
                      {post.author.name[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[var(--pixel-text)] truncate">
                      {post.author.name}
                    </div>
                    <div className="text-xs text-[var(--pixel-text-dim)]">
                      {formatTimeAgo(post.createdAt)}
                    </div>
                  </div>
                </div>

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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

