"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

interface FollowButtonProps {
  userId: string
  isFollowing: boolean
}

export function FollowButton({ userId, isFollowing: initialIsFollowing }: FollowButtonProps) {
  const { data: session } = useSession()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  const handleFollow = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const response = await fetch("/api/follow", {
        method: isFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-full font-semibold transition-colors ${
        isFollowing
          ? "border border-gray-700 hover:bg-gray-900"
          : "bg-white text-black hover:bg-gray-200"
      } disabled:opacity-50`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  )
}

