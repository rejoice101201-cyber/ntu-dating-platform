'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Link from 'next/link'

interface User {
  id: string
  name: string
  birthday?: string
  gender?: string
  bio?: string
  location?: string
  height?: number
  weight?: number
  occupation?: string
  school?: string
  bloodType?: string
  photos: Array<{ id: string; url: string; blurLevel: number; isCover?: boolean }>
  tags: Array<{ tag: { name: string; category: string } }>
  unlockProgress?: {
    unlockLevel: number
    qaCompleted: number
  }
}

// 计算年龄
function calculateAge(birthday: string): number {
  const today = new Date()
  const birthDate = new Date(birthday)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// 获取星座
function getZodiacSign(birthday: string): string {
  const date = new Date(birthday)
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '牡羊座'
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '金牛座'
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return '雙子座'
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return '巨蟹座'
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '獅子座'
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '處女座'
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return '天秤座'
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return '天蠍座'
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return '射手座'
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '摩羯座'
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '水瓶座'
  return '雙魚座'
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuthStore()
  const userId = params.id as string
  const isOwnProfile = userId === currentUser?.id

  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [datingNote, setDatingNote] = useState('')
  const [matchId, setMatchId] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
    if (!isOwnProfile) {
      checkMatch()
    }
  }, [userId, isOwnProfile])

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

  const checkMatch = async () => {
    if (!currentUser?.id) return
    
    try {
      const response = await api.get('/matches')
      const matches = response.data.matches || []
      const match = matches.find((m: any) => 
        m.user?.id === userId || m.otherUser?.id === userId
      )
      if (match) {
        setMatchId(match.id)
      }
    } catch (error) {
      console.error('Failed to check match:', error)
    }
  }

  // 按分类组织标签
  const tagsByCategory = profile?.tags.reduce((acc, ut) => {
    const category = ut.tag.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(ut.tag.name)
    return acc
  }, {} as Record<string, string[]>) || {}

  // 获取封面照片
  const coverPhoto = profile?.photos.find(p => p.isCover) || profile?.photos[0]
  const photoUrl = coverPhoto?.url || ''
  const blurLevel = coverPhoto?.blurLevel || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-500">載入中...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-500">用戶不存在</p>
      </div>
    )
  }

  const age = profile.birthday ? calculateAge(profile.birthday) : null
  const zodiacSign = profile.birthday ? getZodiacSign(profile.birthday) : null

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-yellow-400 rounded-b-3xl pb-4 relative">
        <div className="flex items-center justify-between px-4 pt-12 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐕</span>
          </div>
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="flex flex-col items-center -mt-8 px-4">
        {/* Main Profile Picture */}
        <div className="relative">
          <div
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
            style={{
              filter: `blur(${blurLevel}px)`,
              backgroundImage: photoUrl ? `url(${photoUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: photoUrl ? 'transparent' : '#e5e7eb',
            }}
          />
          {/* 柴犬头像（小） */}
          <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-yellow-100 border-2 border-white flex items-center justify-center">
            <span className="text-2xl">🐕</span>
          </div>
        </div>

        {/* Name */}
        <h2 className="text-2xl font-bold mt-4">{profile.name}</h2>

        {/* Basic Info Tags */}
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {profile.gender && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              {profile.gender === 'female' ? '♀' : profile.gender === 'male' ? '♂' : '⚧'} {age || ''}
            </span>
          )}
          {profile.school && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {profile.school}
            </span>
          )}
          {profile.location && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {profile.location}
            </span>
          )}
          {zodiacSign && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {zodiacSign}
            </span>
          )}
        </div>

        {/* Bio Introduction */}
        {profile.bio && (
          <div className="mt-4 px-4 text-center">
            <p className="text-gray-700 text-sm">{profile.bio}</p>
            <span className="text-2xl mt-2 inline-block">🤔</span>
          </div>
        )}
      </div>

      {/* Content Sections */}
      <div className="px-4 mt-6 space-y-6 pb-20">
        {/* 基本資料 (Basic Info) */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3">基本資料</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {profile.height && (
              <div>
                <span className="text-gray-600">身高：</span>
                <span className="font-medium">{profile.height} cm</span>
              </div>
            )}
            {profile.weight && (
              <div>
                <span className="text-gray-600">體重：</span>
                <span className="font-medium">{profile.weight} kg</span>
              </div>
            )}
            {profile.occupation && (
              <div>
                <span className="text-gray-600">職業：</span>
                <span className="font-medium">{profile.occupation}</span>
              </div>
            )}
            {profile.school && (
              <div>
                <span className="text-gray-600">學校：</span>
                <span className="font-medium">{profile.school}</span>
              </div>
            )}
            {profile.bloodType && (
              <div>
                <span className="text-gray-600">血型：</span>
                <span className="font-medium">{profile.bloodType}</span>
              </div>
            )}
            {profile.location && (
              <div>
                <span className="text-gray-600">出沒地點：</span>
                <span className="font-medium">{profile.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* 個性 (Personality) */}
        {tagsByCategory['personality'] && tagsByCategory['personality'].length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-2">個性</h3>
            <div className="flex flex-wrap gap-2">
              {tagsByCategory['personality'].map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 興趣 (Interests) */}
        {tagsByCategory['interest'] && tagsByCategory['interest'].length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-2">興趣</h3>
            <div className="flex flex-wrap gap-2">
              {tagsByCategory['interest'].map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 外貌 (Appearance) */}
        {tagsByCategory['appearance'] && tagsByCategory['appearance'].length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-2">外貌</h3>
            <div className="flex flex-wrap gap-2">
              {tagsByCategory['appearance'].map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 感情 (Relationship) */}
        {tagsByCategory['lifestyle'] && tagsByCategory['lifestyle'].length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-2">感情</h3>
            <div className="flex flex-wrap gap-2">
              {tagsByCategory['lifestyle'].map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 自我介紹 (Self-introduction) */}
        {profile.bio && (
          <div>
            <h3 className="text-lg font-bold mb-2">自我介紹</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* 交友筆記 (Dating Notes) - 只有自己看得到 */}
        {isOwnProfile && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-bold mb-2">交友筆記</h3>
            <div className="relative">
              <input
                type="text"
                value={datingNote}
                onChange={(e) => setDatingNote(e.target.value)}
                placeholder="你可以在這裡作筆記,只有自己看得到。"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <span className="absolute right-3 top-3 text-gray-400">✏️</span>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isOwnProfile && (
          <div className="flex gap-2 mt-6">
            {matchId ? (
              <Link
                href={`/chat/${matchId}`}
                className="flex-1 bg-yellow-400 text-gray-900 py-3 rounded-lg text-center font-bold hover:bg-yellow-500 transition-colors"
              >
                開始聊天
              </Link>
            ) : (
              <div className="flex-1 bg-gray-200 text-gray-600 py-3 rounded-lg text-center font-bold">
                需要先配對才能聊天
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
