'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Pusher from 'pusher-js'

interface UnreadCounts {
  [matchId: string]: number
}

export function useUnreadMessages() {
  const { token, user } = useAuthStore()
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({})
  const [totalUnread, setTotalUnread] = useState(0)
  const [pusher, setPusher] = useState<Pusher | null>(null)

  const loadUnreadMessages = useCallback(async () => {
    if (!token) {
      setUnreadCounts({})
      setTotalUnread(0)
      return
    }

    try {
      const response = await api.get('/notifications/unread-messages')
      setUnreadCounts(response.data.unreadCounts || {})
      setTotalUnread(response.data.totalUnread || 0)
    } catch (error) {
      console.error('Failed to load unread messages:', error)
      setUnreadCounts({})
      setTotalUnread(0)
    }
  }, [token])

  useEffect(() => {
    if (!token || !user?.id) {
      setUnreadCounts({})
      setTotalUnread(0)
      return
    }

    // 加载初始未读消息数量
    loadUnreadMessages()

    // 初始化 Pusher 实时更新
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2'

    if (pusherKey && pusherCluster) {
      try {
        const newPusher = new Pusher(pusherKey, {
          cluster: pusherCluster,
        })

        // 订阅用户频道，接收未读消息更新
        const channel = newPusher.subscribe(`user-${user.id}`)
        
        // 监听未读消息更新事件
        channel.bind('unread_messages_update', (data: { unreadCounts: UnreadCounts; totalUnread: number }) => {
          setUnreadCounts(data.unreadCounts || {})
          setTotalUnread(data.totalUnread || 0)
        })

        // 监听新消息事件，实时更新未读数
        channel.bind('new_message', (message: any) => {
          if (message.senderId !== user.id && message.matchId) {
            setUnreadCounts((prev) => {
              const newCounts = {
                ...prev,
                [message.matchId]: (prev[message.matchId] || 0) + 1,
              }
              // 更新总数
              const newTotal = Object.values(newCounts).reduce((sum, count) => sum + count, 0)
              setTotalUnread(newTotal)
              return newCounts
            })
          }
        })

        setPusher(newPusher)

        return () => {
          newPusher.disconnect()
        }
      } catch (error) {
        console.error('Failed to initialize Pusher for unread messages:', error)
      }
    }

    // 轮询备份（每30秒检查一次）
    const interval = setInterval(() => {
      loadUnreadMessages()
    }, 30000)

    return () => {
      if (interval) clearInterval(interval)
      if (pusher) pusher.disconnect()
    }
  }, [token, user?.id, loadUnreadMessages])

  // 清除某个匹配的未读数（当用户进入聊天页面时调用）
  const clearUnreadCount = useCallback((matchId: string) => {
    setUnreadCounts((prev) => {
      const newCounts = { ...prev }
      const count = newCounts[matchId] || 0
      if (count > 0) {
        delete newCounts[matchId]
        setTotalUnread((prevTotal) => Math.max(0, prevTotal - count))
      }
      return newCounts
    })
  }, [])

  const getUnreadCount = useCallback((matchId: string) => {
    return unreadCounts[matchId] || 0
  }, [unreadCounts])

  return {
    unreadCounts,
    totalUnread,
    getUnreadCount,
    clearUnreadCount,
    refresh: loadUnreadMessages,
  }
}

