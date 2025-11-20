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
    weight: '',
    occupation: '',
    school: '',
    bloodType: '',
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
        weight: response.data.weight?.toString() || '',
        occupation: response.data.occupation || '',
        school: response.data.school || '',
        bloodType: response.data.bloodType || '',
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
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        occupation: formData.occupation || undefined,
        school: formData.school || undefined,
        bloodType: formData.bloodType || undefined,
      })
      await loadProfile()
      setEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('photo', file)

      const token = localStorage.getItem('token')
      if (!token) {
        alert('請先登入')
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/users/me/photos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        console.error('Upload failed:', errorData)
        alert(`照片上傳失敗：${errorData.error || errorData.details || '未知錯誤'}`)
        return
      }

      const result = await response.json()
      console.log('Photo uploaded successfully:', result)
      await loadProfile()
      // Reset input
      e.target.value = ''
    } catch (error) {
      console.error('Failed to upload photo:', error)
      alert(`照片上傳失敗：${error instanceof Error ? error.message : '請重試'}`)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('確定要刪除這張照片嗎？')) return

    try {
      await api.delete(`/photos/${photoId}`)
      await loadProfile()
    } catch (error) {
      console.error('Failed to delete photo:', error)
      alert('刪除照片失敗，請重試')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>載入中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">我的資料</h1>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-primary-500 hover:text-primary-600"
              >
                編輯
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
                  儲存
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
                <label className="block text-sm font-medium mb-1">自我介紹</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">地區</label>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">體重 (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">血型</label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">請選擇</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">職業</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">學校</label>
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
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
                    <h2 className="font-semibold mb-2">自我介紹</h2>
                  <p className="text-gray-700">{profile.bio}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {profile?.location && (
                  <div>
                    <h2 className="font-semibold mb-2">地區</h2>
                    <p>{profile.location}</p>
                  </div>
                )}
                {profile?.height && (
                  <div>
                    <h2 className="font-semibold mb-2">身高</h2>
                    <p>{profile.height} cm</p>
                  </div>
                )}
                {profile?.weight && (
                  <div>
                    <h2 className="font-semibold mb-2">體重</h2>
                    <p>{profile.weight} kg</p>
                  </div>
                )}
                {profile?.occupation && (
                  <div>
                    <h2 className="font-semibold mb-2">職業</h2>
                    <p>{profile.occupation}</p>
                  </div>
                )}
                {profile?.school && (
                  <div>
                    <h2 className="font-semibold mb-2">學校</h2>
                    <p>{profile.school}</p>
                  </div>
                )}
                {profile?.bloodType && (
                  <div>
                    <h2 className="font-semibold mb-2">血型</h2>
                    <p>{profile.bloodType}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">我的照片</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-primary-500 hover:text-primary-600 text-sm"
              >
                編輯
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {profile?.photos?.map((photo: any) => {
              // Convert relative URL to absolute URL
              const photoUrl = photo.url.startsWith('http') 
                ? photo.url 
                : photo.url; // Vercel Blob URLs are already absolute
              
              return (
              <div
                key={photo.id}
                className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative group"
              >
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load image:', photoUrl);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {editing && (
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                )}
              </div>
            );
            })}
            {editing && (
              <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                <label className="cursor-pointer w-full h-full flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <span className="text-4xl text-gray-400">+</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

