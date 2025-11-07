"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface EditProfileModalProps {
  user: {
    id: string
    name: string | null
    bio: string | null
    banner: string | null
  }
  onClose: () => void
}

export function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const router = useRouter()
  const [name, setName] = useState(user.name || "")
  const [bio, setBio] = useState(user.bio || "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Edit profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/160</p>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-700 hover:bg-gray-900 transition-colors"
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

