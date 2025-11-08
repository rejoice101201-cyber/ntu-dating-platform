"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface NotificationItemProps {
  id: string
  type: "repost" | "like_post" | "like_comment"
  user: {
    id: string
    name: string | null
    image: string | null
    userID: string | null
  }
  post: {
    id: string
    content: string
    createdAt: Date
  }
  createdAt: Date
}

export function NotificationItem({
  type,
  user,
  post,
  createdAt,
}: NotificationItemProps) {
  const router = useRouter()

  const getNotificationText = () => {
    switch (type) {
      case "repost":
        return "reposted your post"
      case "like_post":
        return "liked your post"
      case "like_comment":
        return "liked your comment"
      default:
        return "interacted with your content"
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days} ${days === 1 ? "day" : "days"} ago`
    }
    if (hours > 0) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    }
    if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    }
    return "just now"
  }

  const handleClick = () => {
    router.push(`/post/${post.id}`)
  }

  const displayName = user.name || `@${user.userID || "unknown"}`
  const previewContent = post.content.length > 100 
    ? post.content.substring(0, 100) + "..." 
    : post.content

  return (
    <div
      onClick={handleClick}
      className="p-4 border-b border-gray-800 hover:bg-gray-900/50 transition-colors cursor-pointer"
    >
      <div className="flex gap-3">
        {/* User Avatar */}
        <Link
          href={`/profile/${user.userID || user.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
        >
          <img
            src={user.image || "/default-avatar.png"}
            alt={user.name || "User"}
            className="w-12 h-12 rounded-full object-cover"
          />
        </Link>

        {/* Notification Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-white">
                <Link
                  href={`/profile/${user.userID || user.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold hover:underline"
                >
                  {displayName}
                </Link>
                <span className="text-gray-500"> {getNotificationText()}</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {formatTimeAgo(createdAt)}
              </p>
            </div>
          </div>

          {/* Post Preview */}
          <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
            <p className="text-gray-300 text-sm line-clamp-3">
              {previewContent}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

