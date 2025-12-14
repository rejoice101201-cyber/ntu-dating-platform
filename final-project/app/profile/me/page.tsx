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
  const [matchPreference, setMatchPreference] = useState({
    gender: null as string | null,
    minAge: null as number | null,
    maxAge: null as number | null,
  })

  useEffect(() => {
    if (!token) {
      router.push('/auth/signin')
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
      
      // Load match preferences
      try {
        const prefResponse = await api.get('/users/me/preferences')
        setMatchPreference({
          gender: prefResponse.data.preference?.gender || null,
          minAge: prefResponse.data.preference?.minAge || null,
          maxAge: prefResponse.data.preference?.maxAge || null,
        })
      } catch (error) {
        console.error('Failed to load match preferences:', error)
      }
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
        router.push('/auth/signin')
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
        alert(`Photo upload failed: ${errorData.error || errorData.details || 'Unknown error'}`)
        return
      }

      const result = await response.json()
      console.log('Photo uploaded successfully:', result)
      await loadProfile()
      // Reset input
      e.target.value = ''
    } catch (error) {
      console.error('Failed to upload photo:', error)
      alert(`Photo upload failed: ${error instanceof Error ? error.message : 'Please try again'}`)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return

    try {
      await api.delete(`/photos/${photoId}`)
      await loadProfile()
    } catch (error) {
      console.error('Failed to delete photo:', error)
      alert('Delete failed, please try again')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">My profile</h1>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-primary-500 hover:text-primary-600"
              >
                Edit
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
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="text-primary-500 hover:text-primary-600"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Height (cm)</label>
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
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Blood type</label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">School</label>
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
                <h2 className="font-semibold mb-2">Name</h2>
                <p>{profile?.name || 'Not set'}</p>
              </div>
              <div>
                <h2 className="font-semibold mb-2">Bio</h2>
                <p className="text-gray-700">{profile?.bio || 'Not set'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h2 className="font-semibold mb-2">Location</h2>
                  <p>{profile?.location || 'Not set'}</p>
                </div>
                <div>
                  <h2 className="font-semibold mb-2">Height</h2>
                  <p>{profile?.height ? `${profile.height} cm` : 'Not set'}</p>
                </div>
                <div>
                  <h2 className="font-semibold mb-2">Weight</h2>
                  <p>{profile?.weight ? `${profile.weight} kg` : 'Not set'}</p>
                </div>
                <div>
                  <h2 className="font-semibold mb-2">Occupation</h2>
                  <p>{profile?.occupation || 'Not set'}</p>
                </div>
                <div>
                  <h2 className="font-semibold mb-2">School</h2>
                  <p>{profile?.school || 'Not set'}</p>
                </div>
                <div>
                  <h2 className="font-semibold mb-2">Blood type</h2>
                  <p>{profile?.bloodType || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Match Preferences Section */}
        <div className="bg-white rounded-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Match preferences</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-primary-500 hover:text-primary-600"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      await api.put('/users/me/preferences', {
                        gender: matchPreference.gender || null,
                        minAge: matchPreference.minAge || null,
                        maxAge: matchPreference.maxAge || null,
                      })
                      await loadProfile()
                      setEditing(false)
                    } catch (error) {
                      console.error('Failed to save match preferences:', error)
                      alert('Failed to save preferences. Please try again.')
                    }
                  }}
                  className="text-primary-500 hover:text-primary-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    loadProfile()
                  }}
                  className="text-gray-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gender preference</label>
                <select
                  value={matchPreference.gender || ''}
                  onChange={(e) => setMatchPreference({ ...matchPreference, gender: e.target.value || null })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min age</label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={matchPreference.minAge || ''}
                    onChange={(e) => setMatchPreference({ 
                      ...matchPreference, 
                      minAge: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Any"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max age</label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={matchPreference.maxAge || ''}
                    onChange={(e) => setMatchPreference({ 
                      ...matchPreference, 
                      maxAge: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Any"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold mb-2">Gender preference</h2>
                <p>
                  {matchPreference.gender === 'male'
                    ? 'Male'
                    : matchPreference.gender === 'female'
                    ? 'Female'
                    : matchPreference.gender === 'other'
                    ? 'Other'
                    : 'Any'}
                </p>
              </div>
              <div>
                <h2 className="font-semibold mb-2">Age range</h2>
                <p>
                  {matchPreference.minAge || matchPreference.maxAge
                    ? `${matchPreference.minAge || 'Any'} - ${matchPreference.maxAge || 'Any'}`
                    : 'Any'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My photos</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-primary-500 hover:text-primary-600 text-sm"
              >
                Edit
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

