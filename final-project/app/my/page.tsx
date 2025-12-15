'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

interface Post {
  id: string
  authorId: string
  content: string
  imageUrl: string | null
  type: 'FREE' | 'TOPIC'
  topic?: {
    id: string
    title: string
  } | null
  createdAt: string
  updatedAt?: string
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
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

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
      if (!user?.id) {
        setPosts([])
        return
      }
      const response = await api.get('/posts?authorId=' + user.id)
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
                className="pixel-panel p-4 space-y-3 relative"
              >
                {/* Header with actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[var(--pixel-text-dim)]">
                      {formatTimeAgo(post.createdAt)}
                    </div>
                  </div>
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
                          onClick={() => {
                            setEditingPostId(post.id)
                            setEditContent(post.content)
                            setOpenMenuPostId(null)
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--pixel-surface)]"
                        >
                          編輯
                        </button>
                        <button
                          onClick={async () => {
                            if (deletingPostId) return
                            const confirmed = typeof window !== 'undefined'
                              ? window.confirm('確定要刪除這則貼文嗎？')
                              : true
                            if (!confirmed) return
                            try {
                              setDeletingPostId(post.id)
                              await api.delete(`/posts/${post.id}`)
                              setPosts((prev) => prev.filter((p) => p.id !== post.id))
                            } catch (error: any) {
                              console.error('Delete post failed:', error)
                              alert(error.response?.data?.error || '刪除貼文失敗')
                            } finally {
                              setDeletingPostId(null)
                              setOpenMenuPostId(null)
                            }
                          }}
                          disabled={deletingPostId === post.id}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingPostId === post.id ? '刪除中...' : '刪除'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Topic Badge */}
                {post.type === 'TOPIC' && post.topic && (
                  <div className="px-3 py-1 bg-[var(--pixel-highlight)] text-white text-xs font-bold border-3 border-[var(--pixel-border)] inline-block mb-2">
                    📌 {post.topic.title}
                  </div>
                )}

                {/* Content / Edit */}
                {editingPostId === post.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full min-h-[100px] p-3 bg-[var(--pixel-surface)] border-3 border-[var(--pixel-border)] text-[var(--pixel-text)] resize-none focus:outline-none focus:ring-0"
                      disabled={savingEdit}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          if (!editingPostId) return
                          const trimmed = editContent.trim()
                          if (!trimmed) {
                            alert('內容不可為空')
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
                          } catch (error: any) {
                            console.error('Update post failed:', error)
                            alert(error.response?.data?.error || '更新貼文失敗')
                          } finally {
                            setSavingEdit(false)
                          }
                        }}
                        disabled={savingEdit}
                        className="px-4 py-2 bg-[var(--pixel-highlight)] text-white border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] font-bold hover:shadow-[2px_2px_0_rgba(0,0,0,0.25)] transition-all disabled:opacity-50"
                      >
                        {savingEdit ? '儲存中...' : '儲存'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingPostId(null)
                          setEditContent('')
                        }}
                        disabled={savingEdit}
                        className="px-4 py-2 bg-[var(--pixel-panel)] text-[var(--pixel-text)] border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] font-bold hover:bg-[var(--pixel-surface)] transition-all"
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
