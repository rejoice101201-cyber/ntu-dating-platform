"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { NotificationItem } from "@/components/notifications/NotificationItem"

interface Notification {
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

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || !session.user) {
      router.push("/auth/signin")
      return
    }

    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications")
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
        } else {
          console.error("Failed to fetch notifications")
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [session, status, router])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen border-x border-gray-800">
        <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-gray-800 p-4">
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
        <div className="p-8 text-center text-gray-500">
          <p>載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen border-x border-gray-800">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-gray-800 p-4">
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>

      {/* Notifications Content */}
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p className="text-lg">No notifications yet</p>
          <p className="text-sm mt-2">
            You'll see notifications when someone reposts, likes your posts, or likes your comments.
          </p>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              id={notification.id}
              type={notification.type}
              user={notification.user}
              post={notification.post}
              createdAt={new Date(notification.createdAt)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

