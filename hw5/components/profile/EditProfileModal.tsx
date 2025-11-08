"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

interface EditProfileModalProps {
  user: {
    id: string
    name: string | null
    bio: string | null
    banner: string | null
    image: string | null
  }
  onClose: () => void
}

export function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const router = useRouter()
  const [name, setName] = useState(user.name || "")
  const [bio, setBio] = useState(user.bio || "")
  const [bannerPreview, setBannerPreview] = useState<string | null>(user.banner)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Convert files to base64 if they exist
      let bannerBase64: string | null = null
      let avatarBase64: string | null = null

      if (bannerFile) {
        bannerBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(bannerFile)
        })
      }

      if (avatarFile) {
        avatarBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(avatarFile)
        })
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          bio,
          banner: bannerBase64 || bannerPreview,
          image: avatarBase64 || avatarPreview,
        }),
      })

      if (response.ok) {
        router.refresh()
        onClose()
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-2xl p-6 my-8">
        <h2 className="text-xl font-bold mb-4">Edit profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Banner</label>
            <div className="relative">
              <div className="w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No banner image
                  </div>
                )}
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="absolute bottom-2 right-2 px-4 py-2 bg-black/70 hover:bg-black/90 rounded-full text-white text-sm font-semibold transition-colors"
              >
                {bannerPreview ? "Change" : "Add banner"}
              </button>
            </div>
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Profile picture</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={avatarPreview || "/default-avatar.png"}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-full border-4 border-gray-800 object-cover"
                />
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-700 rounded-full hover:bg-gray-900 transition-colors text-sm font-semibold"
                >
                  {avatarPreview ? "Change" : "Add photo"}
                </button>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              maxLength={50}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-white"
              rows={4}
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/160</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-700 hover:bg-gray-900 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

