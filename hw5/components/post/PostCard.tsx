"use client"

import { PostWithAuthor } from "@/types"
import { formatRelativeTime } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface PostCardProps {
  post: PostWithAuthor
}

export function PostCard({ post }: PostCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [isReposted, setIsReposted] = useState(post.isReposted || false)
  const [repostCount, setRepostCount] = useState(post._count.reposts)
  const [commentCount] = useState(post._count.comments)
  const [showMenu, setShowMenu] = useState(false)
  
  const isOwnPost = session?.user?.id === post.author.id

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/likes`, {
        method: isLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
    }
  }

  const handleRepost = async () => {
    try {
      const response = await fetch(`/api/reposts`, {
        method: isReposted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      })

      if (response.ok) {
        setIsReposted(!isReposted)
        setRepostCount((prev) => (isReposted ? prev - 1 : prev + 1))
      }
    } catch (error) {
      console.error("Failed to toggle repost:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to delete post:", error)
    }
  }

  const formatContent = (content: string) => {
    // Replace URLs with links
    let formatted = content.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
    )
    
    // Replace hashtags
    formatted = formatted.replace(
      /#(\w+)/g,
      '<span class="text-blue-500 hover:underline cursor-pointer">#$1</span>'
    )
    
    // Replace mentions
    formatted = formatted.replace(
      /@(\w+)/g,
      '<a href="/profile/$1" class="text-blue-500 hover:underline">@$1</a>'
    )
    
    return formatted
  }

  return (
    <article className="border-b border-gray-800 p-4 hover:bg-gray-900/50 transition-colors">
      <div className="flex gap-4">
        <Link href={`/profile/${post.author.userID}`}>
          <img
            src={post.author.image || "/default-avatar.png"}
            alt={post.author.name || "User"}
            className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity"
          />
        </Link>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Link 
                href={`/profile/${post.author.userID}`}
                className="font-semibold hover:underline"
              >
                {post.author.name}
              </Link>
              <Link 
                href={`/profile/${post.author.userID}`}
                className="text-gray-500 hover:underline"
              >
                @{post.author.userID}
              </Link>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">{formatRelativeTime(new Date(post.createdAt))}</span>
            </div>
            {isOwnPost && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-900 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="6" cy="12" r="1.5" />
                    <circle cx="18" cy="12" r="1.5" />
                  </svg>
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-10 bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden z-10">
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left hover:bg-gray-800 text-red-500 transition-colors"
                    >
                      刪除
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <Link href={`/post/${post.id}`}>
            <div 
              className="mb-4 whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
            />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-8 text-gray-500">
            <Link
              href={`/post/${post.id}`}
              className="flex items-center gap-2 hover:text-blue-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{commentCount}</span>
            </Link>

            <button
              onClick={handleRepost}
              className={`flex items-center gap-2 transition-colors ${
                isReposted ? "text-green-500" : "hover:text-green-500"
              }`}
            >
              <svg className="w-5 h-5" fill={isReposted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{repostCount}</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${
                isLiked ? "text-red-500" : "hover:text-red-500"
              }`}
            >
              <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

