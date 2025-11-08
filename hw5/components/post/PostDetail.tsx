"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { PostCard } from "./PostCard"
import { PostComposer } from "./PostComposer"
import { PostWithAuthor } from "@/types"
import { signalInternalNavigation } from "@/components/layout/BackButtonHandler"
import { getPusherClient } from "@/lib/pusher-client"

interface PostDetailProps {
  post: PostWithAuthor & { isLiked?: boolean; isReposted?: boolean }
  comments: PostWithAuthor[]
}

export function PostDetail({ post, comments: initialComments }: PostDetailProps) {
  const router = useRouter()
  const [comments, setComments] = useState<PostWithAuthor[]>(initialComments)

  // Pusher real-time updates for new comments
  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if Pusher is configured
    if (!process.env.NEXT_PUBLIC_PUSHER_APP_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      return
    }

    try {
      const pusher = getPusherClient()
      const channel = pusher.subscribe(`post-${post.id}`)

      channel.bind("new-comment", (data: { comment: PostWithAuthor }) => {
        setComments((prev) => {
          // Check if comment already exists to avoid duplicates
          const exists = prev.some((c) => c.id === data.comment.id)
          if (exists) return prev
          return [...prev, data.comment]
        })
      })

      return () => {
        pusher.unsubscribe(`post-${post.id}`)
      }
    } catch (error) {
      console.error("Failed to subscribe to Pusher channel:", error)
    }
  }, [post.id])

  const handleBack = () => {
    // Signal internal navigation before calling router.back()
    // This ensures the BackButtonHandler sets the ignore flag synchronously
    // before popstate event fires
    signalInternalNavigation()
    router.back()
  }

  return (
    <div>
      {/* Header with back arrow */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-gray-800 p-4 flex items-center gap-4 z-10">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-900 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-bold">Post</span>
      </div>

      {/* Main post */}
      <PostCard post={post} />

      {/* Comment composer */}
      <div className="border-b border-gray-800 p-4">
        <PostComposer parentId={post.id} />
      </div>

      {/* Comments */}
      <div>
        {comments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No comments yet</div>
        ) : (
          comments.map((comment) => (
            <PostCard key={comment.id} post={comment} />
          ))
        )}
      </div>
    </div>
  )
}

