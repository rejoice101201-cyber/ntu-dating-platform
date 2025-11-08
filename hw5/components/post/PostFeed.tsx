"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { PostCard } from "./PostCard"
import { NewPostNotice } from "./NewPostNotice"
import { PostWithAuthor } from "@/types"
import { getPusherClient } from "@/lib/pusher-client"

export function PostFeed({ filter = "all" }: { filter?: "all" | "following" }) {
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [newPostsQueue, setNewPostsQueue] = useState<PostWithAuthor[]>([])
  const [showNotice, setShowNotice] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleShowNewPosts = useCallback(() => {
    setNewPostsQueue((queue) => {
      if (queue.length > 0) {
        // Add queued posts to the top of the feed, filtering out duplicates
        setPosts((prev) => {
          const existingPostIds = new Set(prev.map((p) => p.id))
          const newPosts = queue.filter((p) => !existingPostIds.has(p.id))
          return [...newPosts, ...prev]
        })
        // Clear queue and hide notice
        setShowNotice(false)
        
        // Clear timer
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
        return []
      }
      return queue
    })
  }, [])

  const handleDismissNotice = useCallback(() => {
    // Clear queue without adding to feed
    setNewPostsQueue([])
    setShowNotice(false)
    
    // Clear timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [filter])

  // Pusher real-time updates for new posts
  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if Pusher is configured
    if (!process.env.NEXT_PUBLIC_PUSHER_APP_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      console.warn("Pusher is not configured. Real-time updates will not work.")
      return
    }

    try {
      const pusher = getPusherClient()
      console.log("[PostFeed] Pusher client initialized")
      
      const channel = pusher.subscribe("home-feed")
      console.log("[PostFeed] Subscribed to home-feed channel")
      
      channel.bind("new-post", (data: { post: PostWithAuthor }) => {
        console.log("[PostFeed] Received new-post event:", data.post.id)
        
        // Always queue new posts for "all" filter
        // For "following" filter, we'll show all posts (filtering happens on server side)
        // The Pusher event is broadcast to all clients, so we show the notice
        // Add to queue instead of immediately adding to feed
        setNewPostsQueue((prev) => {
          // Check if post already exists in queue to avoid duplicates
          const exists = prev.some((p) => p.id === data.post.id)
          if (exists) {
            console.log("[PostFeed] Post already in queue, skipping:", data.post.id)
            return prev
          }
          console.log("[PostFeed] Adding post to queue:", data.post.id, "Queue length:", prev.length + 1)
          return [...prev, data.post]
        })
        
        // Show notice
        console.log("[PostFeed] Showing notice for new post")
        setShowNotice(true)
        
        // Clear existing timer if any
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
        
        // Set timer to auto-add posts after 10 seconds (minimum)
        timerRef.current = setTimeout(() => {
          console.log("[PostFeed] Auto-adding posts after 10 seconds")
          handleShowNewPosts()
        }, 10000) // 10 seconds
      })

      // Add connection event listeners for debugging
      pusher.connection.bind("connected", () => {
        console.log("[PostFeed] Pusher connected")
      })
      
      pusher.connection.bind("error", (err: any) => {
        console.error("[PostFeed] Pusher connection error:", err)
      })
      
      channel.bind("pusher:subscription_succeeded", () => {
        console.log("[PostFeed] Successfully subscribed to home-feed channel")
      })
      
      channel.bind("pusher:subscription_error", (err: any) => {
        console.error("[PostFeed] Subscription error:", err)
      })

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
        pusher.unsubscribe("home-feed")
        console.log("[PostFeed] Unsubscribed from home-feed channel")
      }
    } catch (error) {
      console.error("[PostFeed] Failed to subscribe to Pusher channel:", error)
    }
  }, [filter, handleShowNewPosts])

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

  // Debug: Log state values - Must be before any conditional returns
  useEffect(() => {
    console.log("[PostFeed] State update:", {
      showNotice,
      queueLength: newPostsQueue.length,
      postsCount: posts.length,
    })
  }, [showNotice, newPostsQueue.length, posts.length])

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
      {/* New Post Notice */}
      {showNotice && newPostsQueue.length > 0 && (
        <NewPostNotice
          count={newPostsQueue.length}
          onShow={handleShowNewPosts}
          onDismiss={handleDismissNotice}
        />
      )}
      
      {/* Posts Feed */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

