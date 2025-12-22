'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Toast from '@/components/Toast'

interface Post {
  id: string
  authorId: string
  author?: {
    id: string
    name: string | null
  }
  content: string
  imageUrl: string | null
  type: 'FREE' | 'TOPIC'
  topicId?: string | null
  topic?: {
    id: string
    title: string
  } | null
  boardId?: string | null
  board?: {
    id: string
    title: string
  } | null
  createdAt: string
  updatedAt?: string
  isMatched?: boolean
  matchId?: string | null
  isAuthor?: boolean
  isFavorited?: boolean
  likeCount: number
  hasLiked: boolean
}

interface DailyTopic {
  id: string
  date: string
  title: string
  postCount?: number
  createdAt: string
}

function formatTimeAgo(dateString: string): string {
  if (!dateString) return ''
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
  const pathname = usePathname()
  const { user, token } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 每日主題狀態
  const [dailyTopic, setDailyTopic] = useState<DailyTopic | null>(null)
  const [loadingTopic, setLoadingTopic] = useState(true)
  
  // Phase 4: 每日配對上限狀態
  const [dailyMatchCount, setDailyMatchCount] = useState({ count: 0, limit: 3, remaining: 3 })
  
  // Phase 2: 今天是否已發過主題貼文
  const [hasPostedTopicToday, setHasPostedTopicToday] = useState(false)
  const [loadingTopicStatus, setLoadingTopicStatus] = useState(true)
  
  // 篩選狀態
  const [filterTopicId, setFilterTopicId] = useState<string | null>(null)
  const [filterAuthorId, setFilterAuthorId] = useState<string | null>(null)
  const [sort, setSort] = useState<'latest' | 'trending'>('latest')
  
  // 排行榜狀態
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  
  // 熱門主題狀態
  const [trendingTopics, setTrendingTopics] = useState<any[]>([])
  const [loadingTrending, setLoadingTrending] = useState(false)
  
  // 排序載入狀態（局部 loading）
  const [loadingPosts, setLoadingPosts] = useState(false)
  
  // 編輯/刪除狀態
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  
  // 發文狀態
  const [content, setContent] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [postingAsTopic, setPostingAsTopic] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 主題選擇狀態
  const [boardQuery, setBoardQuery] = useState('')
  const [boardResults, setBoardResults] = useState<any[]>([])
  const [boardSearching, setBoardSearching] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState<any | null>(null)
  const [creatingBoard, setCreatingBoard] = useState(false)
  
  // Toast 通知狀態
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!storedToken && !token) {
      router.push('/auth/login')
      return
    }
    
    // 優先載入最重要的內容（貼文）
    loadPosts()
    
    // 並行載入其他數據以提升性能
    Promise.all([
      loadDailyTopic(),
      loadDailyMatchCount(),
      loadTopicStatus(),
      loadLeaderboard(),
      loadTrendingTopics(),
    ]).catch((error) => {
      console.error('Failed to load some data:', error)
    })
  }, [token, router])

  const loadTrendingTopics = async () => {
    try {
      setLoadingTrending(true)
      const res = await api.get('/topics?sort=trending')
      setTrendingTopics(res.data.topics || [])
    } catch (error) {
      console.error('Failed to load trending topics:', error)
    } finally {
      setLoadingTrending(false)
    }
  }

  const loadPosts = async (topicId?: string | null, sortParam?: 'latest' | 'trending') => {
    try {
      // 只在沒有貼文時顯示全頁 loading，否則只顯示局部 loading
      if (posts.length === 0) {
        setLoading(true)
      } else {
        setLoadingPosts(true)
      }
      setError(null)
      const params = new URLSearchParams()
      // 使用傳入的 sortParam，如果沒有則使用當前的 sort 狀態
      params.set('sort', sortParam || sort)
      if (topicId) params.set('topicId', topicId)
      if (filterAuthorId) params.set('authorId', filterAuthorId)
      const url = `/posts?${params.toString()}`
      const response = await api.get(url)
      setPosts(Array.isArray(response.data.posts) ? response.data.posts : [])
    } catch (error: any) {
      console.error('Failed to load posts:', error)
      if (error.response?.status === 401) {
        router.push('/auth/login')
      } else {
        setError('載入貼文失敗')
      }
    } finally {
      setLoading(false)
      setLoadingPosts(false)
    }
  }

  const loadLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true)
      const res = await api.get('/leaderboard/matches')
      setLeaderboard(res.data.users || [])
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoadingLeaderboard(false)
    }
  }

  const handleStartEdit = (post: Post) => {
    setOpenMenuPostId(null)
    setEditingPostId(post.id)
    setEditContent(post.content)
  }

  const handleCancelEdit = () => {
    setEditingPostId(null)
    setEditContent('')
  }

  const handleSaveEdit = async () => {
    if (!editingPostId) return
    const trimmed = editContent.trim()
    if (!trimmed) {
      setToast({ message: '內容不可為空', type: 'error' })
      return
    }
    try {
      setSavingEdit(true)
      const res = await api.patch(`/posts/${editingPostId}`, { content: trimmed })
      const updated = res.data.post
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPostId
            ? { ...p, content: updated.content, updatedAt: updated.updatedAt }
            : p
        )
      )
      setEditingPostId(null)
      setEditContent('')
      setToast({ message: '已更新貼文', type: 'success' })
    } catch (error: any) {
      console.error('Update post failed:', error)
      setToast({
        message: error.response?.data?.error || '更新貼文失敗',
        type: 'error',
      })
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (deletingPostId) return
    const confirmed = typeof window !== 'undefined' ? window.confirm('確定要刪除這則貼文嗎？') : true
    if (!confirmed) return
    try {
      setDeletingPostId(postId)
      await api.delete(`/posts/${postId}`)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      setToast({ message: '已刪除貼文', type: 'success' })
    } catch (error: any) {
      console.error('Delete post failed:', error)
      setToast({
        message: error.response?.data?.error || '刪除貼文失敗',
        type: 'error',
      })
    } finally {
      setDeletingPostId(null)
      setOpenMenuPostId(null)
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
    } catch (error: any) {
      console.error('Toggle favorite failed:', error)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isFavorited: !p.isFavorited } : p
        )
      )
      setToast({
        message: error.response?.data?.error || '更新收藏狀態失敗',
        type: 'error',
      })
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
    } catch (error: any) {
      console.error('Toggle like failed:', error)
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
    }
  }
  
  const loadTopicStatus = async () => {
    try {
      setLoadingTopicStatus(true)
      const response = await api.get('/posts/topic-status')
      setHasPostedTopicToday(response.data.hasPostedToday || false)
    } catch (error: any) {
      console.error('Failed to load topic status:', error)
    } finally {
      setLoadingTopicStatus(false)
    }
  }

  const loadDailyTopic = async () => {
    try {
      setLoadingTopic(true)
      const response = await api.get('/daily-topics')
      setDailyTopic(response.data.topic || null)
    } catch (error: any) {
      console.error('Failed to load daily topic:', error)
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

  useEffect(() => {
    let active = true
    const doSearch = async () => {
      if (!boardQuery.trim()) {
        setBoardResults([])
        return
      }
      try {
        setBoardSearching(true)
        const res = await api.get(`/topics/search?q=${encodeURIComponent(boardQuery.trim())}`)
        if (!active) return
        setBoardResults(res.data.topics || [])
      } catch (error) {
        console.error('Search topics error:', error)
      } finally {
        if (active) setBoardSearching(false)
      }
    }
    const handler = setTimeout(doSearch, 300)
    return () => {
      active = false
      clearTimeout(handler)
    }
  }, [boardQuery])

  const handleCreateBoard = async () => {
    const title = boardQuery.trim()
    if (!title) return
    try {
      setCreatingBoard(true)
      const res = await api.post('/topics', { title })
      const topic = res.data.topic
      setSelectedBoard(topic)
      setBoardResults([])
      setToast({ message: res.data.existed ? '已使用既有主題' : '已建立新主題', type: 'success' })
    } catch (error: any) {
      console.error('Create topic error:', error)
      setToast({ message: error.response?.data?.error || '建立主題失敗', type: 'error' })
    } finally {
      setCreatingBoard(false)
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
        await Promise.all([loadPosts(filterTopicId), loadDailyMatchCount()])
      } else if (data.match.pending) {
        setToast({ message: '已發送配對請求！等待對方回應...', type: 'info' })
        await loadPosts(filterTopicId)
      } else if (data.match.alreadyMatched) {
        setToast({ message: '你們已經配對了！', type: 'info' })
        await loadPosts(filterTopicId)
      }
    } catch (error: any) {
      console.error('Failed to match from post:', error)
      if (error.response?.status === 429) {
        setToast({ message: error.response.data?.message || '每天最多只能從貼文中配對 3 個人', type: 'error' })
        await loadDailyMatchCount()
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
        if (response.status === 429 && errorData.limitReached) {
          throw new Error(errorData.message || '每天只能針對今日話題發文一次')
        }
        throw new Error(errorData.error || '發文失敗')
      }

      setContent('')
      setSelectedImage(null)
      setImagePreview(null)
      setPostingAsTopic(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      await Promise.all([loadPosts(filterTopicId), loadDailyTopic(), loadTopicStatus()])
    } catch (error: any) {
      console.error('Failed to create post:', error)
      setError(error.message || '發文失敗，請稍後再試')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="min-h-screen pb-32 pl-20">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="max-w-6xl mx-auto pt-8 px-4 flex gap-6">
        {/* 左側側欄 */}
        <aside className="w-72 space-y-4">
          <div className="pixel-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-[var(--pixel-text)]">熱門主題</div>
              <div className="text-xs text-[var(--pixel-text-dim)]">{loadingTrending ? '...' : ''}</div>
            </div>
            {trendingTopics.length === 0 && !loadingTrending && (
              <div className="text-xs text-[var(--pixel-text-dim)]">目前沒有熱門主題</div>
            )}
            <div className="flex flex-col gap-2">
              {loadingTrending ? (
                // Skeleton loading for trending topics
                [1, 2, 3].map((i) => (
                  <div key={i} className="px-3 py-2 bg-[var(--pixel-panel)] border-3 border-[var(--pixel-border)] animate-pulse">
                    <div className="h-4 bg-[var(--pixel-surface)] rounded w-3/4"></div>
                  </div>
                ))
              ) : (
                trendingTopics.map((t) => (
                  <Link
                    key={t.id}
                    href={`/topics/${t.id}`}
                    className="px-3 py-2 bg-[var(--pixel-panel)] border-3 border-[var(--pixel-border)] text-[var(--pixel-text)] text-xs font-bold shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:bg-[var(--pixel-surface)] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{t.title}</span>
                      {typeof t.postCount === 'number' && <span className="ml-2 text-[var(--pixel-text-dim)]">{t.postCount}</span>}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="pixel-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-[var(--pixel-text)]">配對排行榜 Top 10</div>
              <div className="text-xs text-[var(--pixel-text-dim)]">
                {loadingLeaderboard ? '...' : ''}
              </div>
            </div>
            {leaderboard.length === 0 && !loadingLeaderboard && (
              <div className="text-xs text-[var(--pixel-text-dim)]">暫無資料</div>
            )}
            <div className="space-y-3">
              {loadingLeaderboard ? (
                // Skeleton loading for leaderboard
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 border-3 border-[var(--pixel-border)] p-2 bg-[var(--pixel-panel)] animate-pulse">
                    <div className="w-10 h-10 border-3 border-[var(--pixel-border)] bg-[var(--pixel-surface)]"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-[var(--pixel-surface)] rounded w-1/2"></div>
                      <div className="h-4 bg-[var(--pixel-surface)] rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : (
                leaderboard.map((u, idx) => (
                <div key={u.id} className="flex items-center gap-3 border-3 border-[var(--pixel-border)] p-2 bg-[var(--pixel-panel)]">
                  <div className="w-10 h-10 border-3 border-[var(--pixel-border)] overflow-hidden bg-[var(--pixel-surface)]">
                    {u.photoUrl ? (
                      <div
                        className="w-full h-full bg-center bg-cover"
                        style={{ backgroundImage: `url(${u.photoUrl})`, filter: `blur(${u.blurLevel ?? 50}px)` }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--pixel-text-dim)]">?</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[var(--pixel-text-dim)]">#{idx + 1} • {u.matchCount} 配對</div>
                    <Link href={`/profile/${u.id}`} className="text-sm font-bold text-[var(--pixel-text)] hover:text-[var(--pixel-highlight)] truncate">
                      {u.userId || u.name || 'User'}
                    </Link>
                    {u.bio && <div className="text-[11px] text-[var(--pixel-text-dim)] truncate">{u.bio}</div>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => { setFilterAuthorId(u.id); loadPosts(filterTopicId) }}
                      className="px-2 py-1 text-[10px]"
                    >
                      查看
                    </button>
                    <button
                      onClick={() => router.push(`/profile/${u.id}`)}
                      className="px-2 py-1 text-[10px] bg-[var(--pixel-panel)] text-[var(--pixel-border)] hover:bg-[var(--pixel-highlight)] hover:text-white"
                    >
                      配對
                    </button>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        </aside>

        {/* 主內容區塊 */}
        <div className="flex-1 space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold uppercase tracking-wide text-[var(--pixel-text)]">{pathname === '/home' ? 'HOME' : 'WALL'}</h1>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--pixel-text-dim)]">排序：</span>
              <button
                type="button"
                onClick={() => { 
                  const newSort = 'latest'
                  setSort(newSort)
                  loadPosts(filterTopicId, newSort)
                }}
                disabled={loadingPosts}
                className={`px-3 py-1 border-3 border-[var(--pixel-border)] transition-all duration-100 font-bold text-xs ${
                  sort === 'latest' 
                    ? 'bg-[var(--pixel-highlight)] text-white shadow-[3px_3px_0_rgba(0,0,0,0.35)]' 
                    : 'bg-[var(--pixel-panel)] text-[var(--pixel-text-dim)] shadow-[3px_3px_0_rgba(0,0,0,0.35)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.35)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-[1px_1px_0_rgba(0,0,0,0.35)] active:translate-x-[2px] active:translate-y-[2px]'
                } ${loadingPosts ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ fontFamily: 'monospace' }}
              >
                {loadingPosts && sort === 'latest' ? '...' : '最新'}
              </button>
              <span className="text-[var(--pixel-text-dim)]">/</span>
              <button
                type="button"
                onClick={() => { 
                  const newSort = 'trending'
                  setSort(newSort)
                  loadPosts(filterTopicId, newSort)
                }}
                disabled={loadingPosts}
                className={`px-3 py-1 border-3 border-[var(--pixel-border)] transition-all duration-100 font-bold text-xs ${
                  sort === 'trending' 
                    ? 'bg-[var(--pixel-highlight)] text-white shadow-[3px_3px_0_rgba(0,0,0,0.35)]' 
                    : 'bg-[var(--pixel-panel)] text-[var(--pixel-text-dim)] shadow-[3px_3px_0_rgba(0,0,0,0.35)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.35)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-[1px_1px_0_rgba(0,0,0,0.35)] active:translate-x-[2px] active:translate-y-[2px]'
                } ${loadingPosts ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ fontFamily: 'monospace' }}
              >
                {loadingPosts && sort === 'trending' ? '...' : '熱門'}
              </button>
            </div>
          </div>

          {/* 每日主題區塊 */}
          {dailyTopic && (
            <div className="pixel-panel p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wide text-[var(--pixel-text-dim)] mb-1">
                    今日話題
                  </div>
                  <button
                    onClick={() => {
                      if (filterTopicId === dailyTopic.id) {
                        setFilterTopicId(null)
                        loadPosts(null)
                      } else {
                        setFilterTopicId(dailyTopic.id)
                        loadPosts(dailyTopic.id)
                      }
                    }}
                    className="block w-full text-left text-base font-bold text-[var(--pixel-text)] mb-2 hover:text-[var(--pixel-highlight)] transition-colors bg-transparent p-0 border-none shadow-none focus:outline-none focus:ring-0"
                  >
                    <span>{dailyTopic.title}</span>
                    {filterTopicId === dailyTopic.id && (
                      <span className="ml-2 text-xs text-[var(--pixel-highlight)]">(已篩選)</span>
                    )}
                  </button>
                  <div className="text-xs text-[var(--pixel-text-dim)]">
                    {dailyTopic.postCount || 0} 則回應
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 發文狀態 */}
          {dailyTopic && !loadingTopicStatus && (
            <div className={`pixel-panel p-3 mb-4 ${hasPostedTopicToday ? 'bg-[var(--pixel-surface)]' : 'bg-[var(--pixel-highlight-2)]/20'}`}>
              <div className="flex items-center gap-2">
                {hasPostedTopicToday ? (
                  <>
                    <span className="text-lg">🔒</span>
                    <span className="text-sm font-bold text-[var(--pixel-text)]">
                      你今天已完成主題貼文
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">🟢</span>
                    <span className="text-sm font-bold text-[var(--pixel-text)]">
                      今天尚未發表主題貼文
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 發文輸入框 */}
          <div className="pixel-panel p-4 space-y-3">
            <form onSubmit={handleSubmit} className="space-y-3">
              {dailyTopic && (
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={postingAsTopic}
                      onChange={(e) => setPostingAsTopic(e.target.checked)}
                      disabled={posting || hasPostedTopicToday}
                      className="w-4 h-4 border-3 border-[var(--pixel-border)] disabled:opacity-50"
                    />
                    <span className={`text-sm ${hasPostedTopicToday ? 'text-[var(--pixel-text-dim)]' : 'text-[var(--pixel-text)]'}`}>
                      針對今日話題發文：{dailyTopic.title}
                    </span>
                  </label>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-[var(--pixel-text-dim)]">主題（可選）</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={boardQuery}
                    onChange={(e) => {
                      setBoardQuery(e.target.value)
                      setSelectedBoard(null)
                    }}
                    placeholder="搜尋或建立主題"
                    className="flex-1 px-3 py-2 bg-[var(--pixel-surface)] border-3 border-[var(--pixel-border)] text-[var(--pixel-text)] focus:outline-none"
                    disabled={posting}
                  />
                  <button
                    type="button"
                    onClick={handleCreateBoard}
                    disabled={creatingBoard || !boardQuery.trim()}
                    className="px-3 py-2 bg-[var(--pixel-highlight)] text白 text-xs font-bold border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.25)] disabled:opacity-50"
                  >
                    {creatingBoard ? '...' : '建立'}
                  </button>
                </div>
                {selectedBoard && (
                  <div className="text-xs text-[var(--pixel-text)]">
                    已選：<span className="font-bold">{selectedBoard.title}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedBoard(null)}
                      className="ml-2 text-[var(--pixel-highlight)] underline"
                    >
                      清除
                    </button>
                  </div>
                )}
                {!selectedBoard && boardResults.length > 0 && (
                  <div className="border-3 border-[var(--pixel-border)] bg-[var(--pixel-panel)]">
                    {boardResults.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedBoard(t)
                          setBoardResults([])
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--pixel-surface)]"
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={postingAsTopic && dailyTopic ? `說說你對「${dailyTopic.title}」的想法...` : "說說你的想法..."}
                className="w-full min-h-[100px] p-3 bg-[var(--pixel-surface)] border-3 border-[var(--pixel-border)] text-[var(--pixel-text)] resize-none focus:outline-none"
                disabled={posting}
              />
              
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover border-3 border-[var(--pixel-border)]" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white border-3 border-[var(--pixel-border)] flex items-center justify-center font-bold"
                  >
                    ×
                  </button>
                </div>
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
                    📷 圖片
                  </span>
                </label>
                
                <button
                  type="submit"
                  disabled={posting || !content.trim()}
                  className="px-6 py-2 bg-[var(--pixel-highlight)] text-white border-3 border-[var(--pixel-border)] shadow-[4px_4px_0_rgba(0,0,0,0.25)] font-bold hover:shadow-[2px_2px_0_rgba(0,0,0,0.25)] transition-all disabled:opacity-50"
                >
                  {posting ? '...' : '發佈'}
                </button>
              </div>
            </form>
          </div>

          {/* Feed */}
          {loading && posts.length === 0 ? (
            <div className="space-y-4">
              {/* Skeleton Loading - 顯示多個骨架讓畫面看起來更順暢 */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="pixel-panel p-4 space-y-3 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--pixel-surface)] border-3 border-[var(--pixel-border)]"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[var(--pixel-surface)] rounded w-1/4"></div>
                      <div className="h-3 bg-[var(--pixel-surface)] rounded w-1/6"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-[var(--pixel-surface)] rounded w-full"></div>
                    <div className="h-4 bg-[var(--pixel-surface)] rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 pixel-panel">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-sm uppercase tracking-wide text-[var(--pixel-text-dim)] mb-2">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="pixel-panel p-4 space-y-3 relative"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--pixel-surface)] border-3 border-[var(--pixel-border)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[var(--pixel-text)]">
                        {post.author?.name ? post.author.name[0]?.toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[var(--pixel-text)] truncate">
                        {post.author?.name || '????'}
                        {!post.author?.name && (
                          <span className="ml-2 text-xs text-[var(--pixel-text-dim)] font-normal">
                            (匿名)
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
                      >
                        <span className={post.isFavorited ? 'text-red-500' : 'text-[var(--pixel-text-dim)]'}>
                          {post.isFavorited ? '❤️' : '🤍'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleLike(post.id)}
                        className="flex items-center gap-1 px-1 text-xs"
                      >
                        <span className={post.hasLiked ? 'text-[var(--pixel-highlight)]' : 'text-[var(--pixel-text-dim)]'}>
                          👍
                        </span>
                        <span className="text-[var(--pixel-text-dim)]">{post.likeCount}</span>
                      </button>
                    {post.isAuthor ? (
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}
                          className="px-2 py-1 text-[var(--pixel-text)] border-3 border-[var(--pixel-border)] bg-[var(--pixel-panel)] hover:bg-[var(--pixel-surface)] shadow-[3px_3px_0_rgba(0,0,0,0.25)]"
                        >
                          ⋯
                        </button>
                        {openMenuPostId === post.id && (
                          <div className="absolute right-0 mt-2 w-28 bg-[var(--pixel-panel)] border-3 border-[var(--pixel-border)] shadow-[4px_4px_0_rgba(0,0,0,0.25)] z-10">
                            <button
                              onClick={() => handleStartEdit(post)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--pixel-surface)]"
                            >
                              編輯
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              disabled={deletingPostId === post.id}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              刪除
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      post.authorId !== user?.id && (
                        <div className="flex items-center gap-2">
                          {post.isMatched && post.matchId ? (
                            <Link
                              href={`/chat/${post.matchId}`}
                              className="px-3 py-1 bg-[var(--pixel-highlight)] text-white text-xs font-bold border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.25)] transition-all"
                            >
                              聊天
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleMatchFromPost(post.id)}
                              disabled={dailyMatchCount.remaining === 0}
                              className="px-3 py-1 bg-[var(--pixel-highlight-2)] text-white text-xs font-bold border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.25)] transition-all disabled:opacity-50"
                            >
                              {dailyMatchCount.remaining === 0 ? '上限' : '配對'}
                            </button>
                          )}
                        </div>
                      )
                    )}
                    </div>
                  </div>

                  {post.type === 'TOPIC' && post.topic?.title && (
                    <div className="px-3 py-1 bg-[var(--pixel-highlight)] text白 text-xs font-bold border-3 border-[var(--pixel-border)] inline-block mb-2">
                      📌 {post.topic.title}
                    </div>
                  )}
                  {post.board?.title && (
                    <Link
                      href={`/topics/${post.board.id}`}
                      className="px-3 py-1 bg-[var(--pixel-panel)] text-[var(--pixel-text)] text-xs font-bold border-3 border-[var(--pixel-border)] inline-block mb-2 hover:bg-[var(--pixel-surface)]"
                    >
                      📌 主題：{post.board.title}
                    </Link>
                  )}

                  {editingPostId === post.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full min-h-[100px] p-3 bg-[var(--pixel-surface)] border-3 border-[var(--pixel-border)] text-[var(--pixel-text)] resize-none focus:outline-none"
                        disabled={savingEdit}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={savingEdit}
                          className="px-4 py-2 bg-[var(--pixel-highlight)] text白 border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] font-bold hover:shadow-[2px_2px_0_rgba(0,0,0,0.25)] disabled:opacity-50"
                        >
                          儲存
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={savingEdit}
                          className="px-4 py-2 bg-[var(--pixel-panel)] text-[var(--pixel-text)] border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] font-bold hover:bg-[var(--pixel-surface)]"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[var(--pixel-text)] whitespace-pre-wrap break-words">
                      {post.content}
                    </div>
                  )}

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
    </div>
  )
}

