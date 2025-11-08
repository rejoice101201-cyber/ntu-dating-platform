"use client"

import { useState, useEffect } from "react"
import { PostCard } from "@/components/post/PostCard"

interface ProfileTabsProps {
  userId: string
  userID: string | null
  isOwnProfile: boolean
}

export function ProfileTabs({ userId, userID, isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "likes">("posts")

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 py-4 text-center font-semibold transition-colors border-b-2 ${
            activeTab === "posts"
              ? "border-white"
              : "border-transparent text-gray-500 hover:bg-gray-900"
          }`}
        >
          Posts
        </button>
        {isOwnProfile && (
          <button
            onClick={() => setActiveTab("likes")}
            className={`flex-1 py-4 text-center font-semibold transition-colors border-b-2 ${
              activeTab === "likes"
                ? "border-white"
                : "border-transparent text-gray-500 hover:bg-gray-900"
            }`}
          >
            Likes
          </button>
        )}
      </div>

      {/* Content */}
      <div className="min-h-screen">
        {activeTab === "posts" ? (
          <UserPostsFeed userId={userId} />
        ) : (
          <UserLikesFeed userId={userId} />
        )}
      </div>
    </div>
  )
}

function UserPostsFeed({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/posts/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  if (posts.length === 0) {
    return <div className="p-8 text-center text-gray-500">No posts yet</div>
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

function UserLikesFeed({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/posts/user/${userId}/likes`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  if (posts.length === 0) {
    return <div className="p-8 text-center text-gray-500">No likes yet</div>
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

