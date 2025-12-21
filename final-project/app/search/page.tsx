'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Link from 'next/link'

export default function SearchPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ id: string; title: string; postCount?: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!storedToken) {
        router.push('/auth/login')
        return
      }
    }
  }, [token, router])

  useEffect(() => {
    let active = true
    const doSearch = async () => {
      if (!query.trim()) {
        setResults([])
        setMessage(null)
        return
      }
      try {
        setLoading(true)
        const res = await api.get(`/topics/search?q=${encodeURIComponent(query.trim())}`)
        if (!active) return
        const topics = res.data.topics || []
        setResults(topics)
        setMessage(topics.length === 0 ? '找不到相關主題，試試建立新的？' : null)
      } catch (error) {
        console.error('Search topics failed:', error)
        if (active) setMessage('搜尋失敗，請稍後再試')
      } finally {
        if (active) setLoading(false)
      }
    }
    const handler = setTimeout(doSearch, 300)
    return () => {
      active = false
      clearTimeout(handler)
    }
  }, [query])

  const handleCreate = async () => {
    const title = query.trim()
    if (!title) return
    try {
      setCreating(true)
      const res = await api.post('/topics', { title })
      const topic = res.data.topic
      setMessage(res.data.existed ? '已使用既有主題' : '已建立新主題')
      setResults([topic, ...results.filter((r) => r.id !== topic.id)])
    } catch (error: any) {
      console.error('Create topic failed:', error)
      setMessage(error.response?.data?.error || '建立主題失敗')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-5xl mx-auto pt-12 px-6">
        <h1 className="text-xl font-bold uppercase tracking-wide text-[var(--pixel-text)] mb-6 text-center">Search Topics</h1>

        <div className="pixel-panel p-5 space-y-4 w-full">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋或建立主題，如：美食、旅行、運動"
              className="flex-1 px-4 py-3 bg-[var(--pixel-surface)] border-3 border-[var(--pixel-border)] text-[var(--pixel-text)] focus:outline-none focus:ring-0 text-base"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !query.trim()}
              className="md:w-auto w-full px-5 py-3 bg-[var(--pixel-highlight)] text-white border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] font-bold hover:shadow-[2px_2px_0_rgba(0,0,0,0.25)] transition-all disabled:opacity-50"
            >
              {creating ? '建立中...' : '建立/套用'}
            </button>
          </div>
          {loading && <div className="text-xs text-[var(--pixel-text-dim)]">搜尋中...</div>}
          {message && <div className="text-xs text-[var(--pixel-text-dim)]">{message}</div>}
          <div className="space-y-2">
            {results.map((topic) => (
              <Link
                key={topic.id}
                href={`/topics/${topic.id}`}
                className="flex items-center justify-between px-3 py-2 bg-[var(--pixel-panel)] border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:bg-[var(--pixel-surface)] transition-colors"
              >
                <span className="text-sm font-bold text-[var(--pixel-text)]">{topic.title}</span>
                <span className="text-xs text-[var(--pixel-text-dim)]">{typeof topic.postCount === 'number' ? `${topic.postCount} 則貼文` : ''}</span>
              </Link>
            ))}
            {!loading && results.length === 0 && !message && (
              <div className="text-xs text-[var(--pixel-text-dim)]">輸入關鍵字開始搜尋主題</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
