'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export default function MyProfilePage() {
  const router = useRouter()
  const { user, token, updateUser } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    height: '',
  })

  useEffect(() => {
    if (!token) {
      router.push('/auth/login')
      return
    }
    loadProfile()
  }, [token])

  const loadProfile = async () => {
    try {
      const response = await api.get(`/users/${user?.id}`)
      setProfile(response.data)
      setFormData({
        name: response.data.name || '',
        bio: response.data.bio || '',
        location: response.data.location || '',
        height: response.data.height?.toString() || '',
      })
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await api.put('/users/me', {
        ...formData,
        height: formData.height ? parseInt(formData.height) : undefined,
      })
      await loadProfile()
      setEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">我的资料</h1>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-primary-500 hover:text-primary-600"
              >
                编辑
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false)
                    loadProfile()
                  }}
                  className="text-gray-600"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="text-primary-500 hover:text-primary-600"
                >
                  保存
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">自我介绍</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">地区</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">身高 (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold mb-2">姓名</h2>
                <p>{profile?.name}</p>
              </div>
              {profile?.bio && (
                <div>
                  <h2 className="font-semibold mb-2">自我介绍</h2>
                  <p className="text-gray-700">{profile.bio}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {profile?.location && (
                  <div>
                    <h2 className="font-semibold mb-2">地区</h2>
                    <p>{profile.location}</p>
                  </div>
                )}
                {profile?.height && (
                  <div>
                    <h2 className="font-semibold mb-2">身高</h2>
                    <p>{profile.height} cm</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">我的照片</h2>
          <div className="grid grid-cols-3 gap-4">
            {profile?.photos?.map((photo: any) => (
              <div
                key={photo.id}
                className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
              >
                <img
                  src={photo.url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

