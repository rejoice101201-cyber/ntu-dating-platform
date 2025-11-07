"use client"

import { useEffect, useState } from "react"
import { PostCard } from "./PostCard"
import { PostWithAuthor } from "@/types"

export function PostFeed({ filter = "all" }: { filter?: "all" | "following" }) {
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [filter])

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?filter=${filter}`)
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        載入中...
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        還沒有文章
      </div>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

