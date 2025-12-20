'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

interface Recommendation {
  id: string
  name: string
  bio?: string
  photos: Array<{ url: string; blurLevel: number }>
  tags: Array<{ tag: { name: string; category: string } }>
  matchScore: number
  commonTags: Array<{ name: string }>
}

export default function DiscoverPage() {
  const router = useRouter()
  const { user, token, setAuth, updateUser } = useAuthStore()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      // Check localStorage as fallback
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!storedToken) {
        router.push('/auth/login')
        return
      }
    }
    refreshEnergy()
    fetchRecommendations()
  }, [token, router])

  const refreshEnergy = async () => {
    try {
      const res = await api.get('/auth/me')
      const fetchedUser = res.data?.user
      if (fetchedUser) {
        if (token) {
          setAuth(fetchedUser, token)
        } else {
          const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
          if (storedToken) setAuth(fetchedUser, storedToken)
          else updateUser(fetchedUser)
        }
      }
    } catch (err) {
      console.error('Failed to refresh energy:', err)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/matches/discover')
      setRecommendations(response.data.recommendations)
      setCurrentIndex(0)
    } catch (error: any) {
      console.error('Failed to fetch recommendations:', error)
      if (error.response?.status === 401) {
        // Token expired, redirect to login
        router.push('/auth/login')
      } else if (!error.response) {
        // Network error - API not available
        console.error('API not available. Check NEXT_PUBLIC_API_URL environment variable.')
        alert('Server is unavailable. Please check API config.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRate = async (score: number) => {
    if (!recommendations[currentIndex]) return

    try {
      await api.post('/matches/rate', {
        userId: recommendations[currentIndex].id,
        score,
      })
      await refreshEnergy()
      
      // Move to next
      if (currentIndex < recommendations.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        fetchRecommendations()
      }
    } catch (error: any) {
      if (error.response?.data?.error?.includes('energy')) {
        alert('體力不足！請稍後再試')
      }
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

  if (recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-700">
          <div className="text-4xl mb-4">🐕</div>
          <p className="text-sm uppercase tracking-wide">No recommendations yet</p>
          <p className="text-xs text-gray-500">Try again later</p>
        </div>
      </div>
    )
  }

  const current = recommendations[currentIndex]

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto pt-8 pb-24 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold uppercase tracking-wide">Discover</h1>
          <div className="flex items-center gap-2 text-sm text-[var(--pixel-text-dim)]">
            <span>Energy</span>
            <span className="px-2 py-1 border-3 border-[var(--pixel-border)] bg-[var(--pixel-panel)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] font-bold text-[var(--pixel-text)]">
              {user?.energy ?? 0}
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="pixel-panel overflow-hidden">
          <div className="relative h-96 bg-[var(--pixel-surface)]">
            {current.photos[0] && (() => {
              const photoUrl = current.photos[0].url
              return (
                <div
                  className="w-full h-full"
                  style={{
                    filter: `blur(${current.photos[0].blurLevel}px)`,
                    backgroundImage: `url(${photoUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )
            })()}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h2 className="text-white text-2xl font-bold mb-1">{current.name}</h2>
              {current.bio && <p className="text-white/90 text-sm">{current.bio}</p>}
              {current.matchScore > 0 && (
                <div className="mt-2 text-sm text-yellow-300">
                  Match score: {current.matchScore}%
                </div>
              )}
            </div>
          </div>

          {current.tags.length > 0 && (
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {current.tags.slice(0, 5).map((ut, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[var(--pixel-surface)] border-3 border-[var(--pixel-border)] text-xs uppercase tracking-wide text-[var(--pixel-text)]"
                  >
                    {ut.tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => router.push(`/profile/${current.id}`)} className="w-full">
            Info
          </button>
          <button onClick={() => router.push(`/profile/${current.id}`)} className="w-full">
            Q&A unlock
          </button>
        </div>

        {/* Rating buttons */}
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-wide text-[var(--pixel-text-dim)]">
            Rate (1-5)
          </p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => handleRate(score)}
                className="w-14 h-14 text-lg font-bold flex items-center justify-center"
              >
                {score}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

