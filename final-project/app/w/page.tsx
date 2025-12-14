'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Toast from '@/components/Toast'

interface Post {
  id: string
  authorId: string
  author: {
    id: string
    name: string | null // Phase 3: 未配對時為 null
  }
  content: string
  imageUrl: string | null
  type: 'FREE' | 'TOPIC'
  topicId?: string | null
  topic?: {
    id: string
    title: string
  } | null
  createdAt: string
  isMatched?: boolean // Phase 3: 是否已配對
  matchId?: string | null // Phase 3: Match ID（用於聊天室入口）
}

interface DailyTopic {
  id: string
  date: string
  title: string
  postCount?: number
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
  
  // 每日主題狀態
  const [dailyTopic, setDailyTopic] = useState<DailyTopic | null>(null)
  const [loadingTopic, setLoadingTopic] = useState(true)
  
  // Phase 4: 每日配對上限狀態
  const [dailyMatchCount, setDailyMatchCount] = useState({ count: 0, limit: 3, remaining: 3 })
  
  // 發文狀態
  const [content, setContent] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [postingAsTopic, setPostingAsTopic] = useState(false) // 是否針對主題發文
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Toast 通知狀態
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    if (!token) {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!storedToken) {
        router.push('/auth/login')
        return
      }
    }
    loadPosts()
    loadDailyTopic()
    loadDailyMatchCount()
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

  const loadDailyTopic = async () => {
    try {
      setLoadingTopic(true)
      const response = await api.get('/daily-topics')
      setDailyTopic(response.data.topic || null)
    } catch (error: any) {
      console.error('Failed to load daily topic:', error)
      // 載入主題失敗不影響頁面，只記錄錯誤
    } finally {
      setLoadingTopic(false)
    }
  }

  const loadDailyMatchCount = async () => {
    try {
      const response = await api.get('/notifications/daily-match-count')
      setDailyMatchCount(response.data)
    } catch (error: any) {
      console.error('Failed to load daily match count:', error)
      // 載入失敗不影響頁面
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

  const handleMatchFromPost = async (postId: string) => {
    try {
      const currentToken = token || localStorage.getItem('token')
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
        // 重新載入貼文以更新配對狀態和配對次數
        await Promise.all([loadPosts(), loadDailyMatchCount()])
      } else if (data.match.pending) {
        setToast({ message: '已發送配對請求！等待對方回應...', type: 'info' })
        // 重新載入貼文
        await loadPosts()
      } else if (data.match.alreadyMatched) {
        setToast({ message: '你們已經配對了！', type: 'info' })
        // 重新載入貼文
        await loadPosts()
      }
    } catch (error: any) {
      console.error('Failed to match from post:', error)
      // Phase 4: 檢查是否是配對上限錯誤
      if (error.response?.status === 429) {
        setToast({ message: error.response.data?.message || '每天最多只能從貼文中配對 3 個人', type: 'error' })
        await loadDailyMatchCount() // 更新配對次數顯示
      } else {
        setToast({ message: error.message || '配對失敗，請稍後再試', type: 'error' })
      }
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
      // 如果選擇針對主題發文，且今日有主題，則加入 topicId
      if (postingAsTopic && dailyTopic) {
        formData.append('topicId', dailyTopic.id)
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
      setPostingAsTopic(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // 重新載入 feed 和主題（更新貼文數量）
      await Promise.all([loadPosts(), loadDailyTopic()])
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
      {/* Toast 通知 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="max-w-2xl mx-auto pt-8 px-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wide text-[var(--pixel-text)]">Wall</h1>
        </div>

        {/* 每日主題區塊 */}
        {dailyTopic && (
          <div className="pixel-panel p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wide text-[var(--pixel-text-dim)] mb-1">
                  今日話題
                </div>
                <div className="text-base font-bold text-[var(--pixel-text)] mb-2">
                  {dailyTopic.title}
                </div>
                {dailyTopic.postCount !== undefined && (
                  <div className="text-xs text-[var(--pixel-text-dim)]">
                    {dailyTopic.postCount} 則回應
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 發文輸入框 */}
        <div className="pixel-panel p-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* 每日主題發文選項 */}
            {dailyTopic && (
              <div className="flex items-center gap-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={postingAsTopic}
                    onChange={(e) => setPostingAsTopic(e.target.checked)}
                    disabled={posting}
                    className="w-4 h-4 border-3 border-[var(--pixel-border)]"
                  />
                  <span className="text-sm text-[var(--pixel-text)]">
                    針對今日話題發文：{dailyTopic.title}
                  </span>
                </label>
              </div>
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={postingAsTopic && dailyTopic ? `說說你對「${dailyTopic.title}」的想法...` : "說說你的想法..."}
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
                      {post.author.name ? post.author.name[0]?.toUpperCase() : '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[var(--pixel-text)] truncate">
                      {/* Phase 3: 未配對時顯示 ???? */}
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
                  {/* Phase 3: 配對/聊天按鈕 */}
                  {post.authorId !== user?.id && (
                    <div className="flex items-center gap-2">
                      {post.isMatched && post.matchId ? (
                        // 已配對：顯示聊天室入口
                        <Link
                          href={`/chat/${post.matchId}`}
                          className="px-3 py-1 bg-[var(--pixel-highlight)] text-white text-xs font-bold border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.25)] transition-all"
                        >
                          聊天
                        </Link>
                      ) : (
                        // 未配對：顯示配對按鈕（Phase 4: 檢查是否達到上限）
                        <button
                          onClick={() => handleMatchFromPost(post.id)}
                          disabled={dailyMatchCount.remaining === 0}
                          className="px-3 py-1 bg-[var(--pixel-highlight-2)] text-white text-xs font-bold border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--pixel-text-dim)]"
                          title={dailyMatchCount.remaining === 0 ? '今日配對上限已達' : ''}
                        >
                          {dailyMatchCount.remaining === 0 ? '已達上限' : '想要配對'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

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
              </div>
            ))}
          </div>
        )}

        {/* Phase 4: 每日配對上限提示 */}
        <div className="pixel-panel p-3 mt-6 text-center">
          <p className="text-xs text-[var(--pixel-text-dim)]">
            每天最多只能從貼文中配對 3 人
          </p>
          <p className="text-sm font-bold text-[var(--pixel-text)] mt-1">
            今日已配對：{dailyMatchCount.count} / {dailyMatchCount.limit}
            {dailyMatchCount.remaining > 0 && (
              <span className="ml-2 text-[var(--pixel-highlight)]">
                （還可配對 {dailyMatchCount.remaining} 人）
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

