'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Link from 'next/link'

interface User {
  id: string
  name: string
  bio?: string
  location?: string
  height?: number
  photos: Array<{ id: string; url: string; blurLevel: number }>
  tags: Array<{ tag: { name: string; category: string } }>
  unlockProgress?: {
    unlockLevel: number
    qaCompleted: number
  }
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuthStore()
  const userId = params.id as string
  const isOwnProfile = userId === currentUser?.id

  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    loadProfile()
    if (!isOwnProfile) {
      loadQuestions()
    }
  }, [userId])

  const loadProfile = async () => {
    try {
      const response = await api.get(`/users/${userId}`)
      setProfile(response.data)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadQuestions = async () => {
    try {
      const response = await api.get('/qa/questions?limit=5')
      const questionsData = response.data.questions || []
      setQuestions(questionsData)
      if (questionsData.length > 0) {
        setSelectedQuestions(questionsData.slice(0, 3).map((q: any) => q.id))
      }
    } catch (error) {
      console.error('Failed to load questions:', error)
      setQuestions([])
    }
  }

  const handlePlayQA = async () => {
    if (!profile || selectedQuestions.length === 0) return

    try {
      const answerArray = selectedQuestions.map(qId => answers[qId] || '')
      const response = await api.post(`/qa/play/${userId}`, {
        questionIds: selectedQuestions,
        answers: answerArray,
      })

      alert(`匹配度: ${response.data.matchPercentage}%！解鎖進度: ${response.data.unlockProgress.unlockLevel}%`)
      loadProfile()
    } catch (error: any) {
      if (error.response?.data?.error?.includes('energy')) {
        alert('體力不足！')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>載入中...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>用戶不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 mr-3"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">{profile.name}</h1>
      </div>

      {/* Photos */}
      <div className="grid grid-cols-2 gap-2 p-4">
        {profile.photos.map((photo) => {
          // Convert relative URL to absolute URL
          const photoUrl = photo.url.startsWith('http') 
            ? photo.url 
            : photo.url; // Vercel Blob URLs are already absolute
          
          return (
          <div
            key={photo.id}
            className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden"
          >
            <div
              className="w-full h-full"
              style={{
                filter: `blur(${photo.blurLevel}px)`,
                backgroundImage: `url(${photoUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {photo.blurLevel > 0 && !isOwnProfile && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="text-white text-sm">需要解鎖</span>
              </div>
            )}
          </div>
        );
        })}
      </div>

      {/* Info */}
      <div className="bg-white p-4 space-y-4">
        {profile.bio && (
          <div>
            <h2 className="font-semibold mb-2">自我介紹</h2>
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {profile.location && (
            <div>
              <span className="text-gray-600">地區: </span>
              <span>{profile.location}</span>
            </div>
          )}
          {profile.height && (
            <div>
              <span className="text-gray-600">身高: </span>
              <span>{profile.height} cm</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {profile.tags.length > 0 && (
          <div>
            <h2 className="font-semibold mb-2">標籤</h2>
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((ut, idx) => (
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

        {/* Unlock Progress */}
        {!isOwnProfile && profile.unlockProgress && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">解鎖進度</h3>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${profile.unlockProgress.unlockLevel}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              已完成 {profile.unlockProgress.qaCompleted} 個問答
            </p>
          </div>
        )}

        {/* Q&A Game */}
        {!isOwnProfile && (
          <div className="border-t pt-4 mt-4">
            {questions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">載入問題中...</p>
                <button
                  onClick={loadQuestions}
                  className="text-primary-500 hover:underline"
                >
                  重新載入
                </button>
              </div>
            ) : (
              <>
            <h3 className="font-semibold mb-4">🐕 問答遊戲 - 解鎖照片</h3>
            <p className="text-sm text-gray-600 mb-4">回答問題來解鎖對方的照片，匹配度越高解鎖越多！</p>
            <div className="space-y-4">
              {selectedQuestions.map((qId) => {
                const question = questions.find((q) => q.id === qId)
                if (!question) return null

                return (
                  <div key={qId} className="border rounded-lg p-3">
                    <p className="font-medium mb-2">{question.content}</p>
                    {question.type === 'multiple_choice' && question.options ? (
                      <div className="space-y-2">
                        {JSON.parse(question.options).map((opt: string, idx: number) => (
                          <label key={idx} className="flex items-center">
                            <input
                              type="radio"
                              name={`q-${qId}`}
                              value={opt}
                              onChange={(e) =>
                                setAnswers({ ...answers, [qId]: e.target.value })
                              }
                              className="mr-2"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={answers[qId] || ''}
                        onChange={(e) =>
                          setAnswers({ ...answers, [qId]: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="輸入答案"
                      />
                    )}
                  </div>
                )
              })}
              <button
                onClick={handlePlayQA}
                className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                提交答案並解鎖
              </button>
            </div>
            </>
            )}
          </div>
        )}

        {/* Actions */}
        {!isOwnProfile && (
          <div className="flex gap-2 mt-4">
            <Link
              href={`/chat/${profile.id}`}
              className="flex-1 bg-primary-500 text-white py-2 rounded-lg text-center hover:bg-primary-600 transition-colors"
            >
              開始聊天
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

