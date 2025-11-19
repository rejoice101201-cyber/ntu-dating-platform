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
  const { user, token } = useAuthStore()
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
    fetchRecommendations()
  }, [token, router])

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
        alert('無法連接到伺服器。請檢查 API 配置。')
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
        <div className="text-center">
          <div className="text-4xl mb-4">🐕</div>
          <p>載入中...</p>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🐕</div>
          <p className="text-gray-600">暫時沒有推薦，請稍後再試</p>
        </div>
      </div>
    )
  }

  const current = recommendations[currentIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-md mx-auto pt-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-4">
          <h1 className="text-2xl font-bold">🐕 探索</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">體力:</span>
            <span className="font-bold text-primary-500">{user?.energy || 0}</span>
          </div>
        </div>

        {/* Card */}
        <div className="mx-4 mb-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Photo */}
            <div className="relative h-96 bg-gray-200">
              {current.photos[0] && (() => {
                // Convert relative URL to absolute URL
                const photoUrl = current.photos[0].url.startsWith('http') 
                  ? current.photos[0].url 
                  : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}${current.photos[0].url}`;
                
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
                );
              })()}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h2 className="text-white text-2xl font-bold mb-1">{current.name}</h2>
                {current.bio && (
                  <p className="text-white/90 text-sm">{current.bio}</p>
                )}
                {current.matchScore > 0 && (
                  <div className="mt-2">
                    <span className="text-yellow-300 text-sm">匹配度: {current.matchScore}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {current.tags.length > 0 && (
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {current.tags.slice(0, 5).map((ut, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {ut.tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 px-4 mb-4">
          <button
            onClick={() => router.push(`/profile/${current.id}`)}
            className="px-6 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
          >
            <span>ℹ️</span>
            <span>查看資料</span>
          </button>
          <button
            onClick={() => router.push(`/profile/${current.id}`)}
            className="px-6 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors flex items-center gap-2"
          >
            <span>🐕</span>
            <span>玩問答解鎖</span>
          </button>
        </div>

        {/* Rating buttons */}
        <div className="px-4">
          <p className="text-center text-sm text-gray-600 mb-3">評分 (1-5分)</p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => handleRate(score)}
                className="w-14 h-14 bg-white rounded-full border-2 border-gray-200 hover:bg-primary-50 hover:border-primary-500 hover:text-primary-600 transition-colors text-lg font-semibold shadow-sm"
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

