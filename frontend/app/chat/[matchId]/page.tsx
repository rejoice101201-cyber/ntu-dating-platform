'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { io, Socket } from 'socket.io-client'
import api from '@/lib/api'

interface Message {
  id: string
  content: string
  type: string
  senderId: string
  sender: {
    id: string
    name: string
  }
  createdAt: string
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuthStore()
  const matchId = params.matchId as string
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) {
      router.push('/auth/login')
      return
    }

    // Initialize socket
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
    const newSocket = io(socketUrl, {
      auth: { token },
    })

    newSocket.on('connect', () => {
      console.log('Connected to chat server')
    })

    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    setSocket(newSocket)

    // Load messages
    loadMessages()

    return () => {
      newSocket.close()
    }
  }, [matchId, token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get(`/chat/${matchId}`)
      setMessages(response.data.messages || [])

      // Get match info to find other user
      const matchResponse = await api.get('/matches')
      const match = matchResponse.data.matches.find((m: any) => m.id === matchId)
      if (match) {
        setOtherUser(match.user)
      } else {
        setError('找不到配對資訊')
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error)
      setError(error.response?.data?.error || '載入訊息失敗')
      if (error.response?.status === 404) {
        setError('配對不存在')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !socket || !user) return

    const messageContent = input.trim()
    
    // Optimistically add message to UI
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      type: 'text',
      senderId: user.id,
      sender: {
        id: user.id,
        name: user.name,
      },
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMessage])
    setInput('')

    // Send message via socket
    socket.emit('send_message', {
      matchId,
      content: messageContent,
      type: 'text',
    })

    // Listen for confirmation
    socket.once('message_sent', (sentMessage: Message) => {
      // Replace temp message with real message
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? sentMessage : msg
      ))
    })
  }

  const getOpeningLines = async () => {
    if (!otherUser?.id) {
      console.error('Other user not loaded yet')
      return
    }
    
    try {
      console.log('Getting opening lines for user:', otherUser.id)
      const response = await api.get(`/ai-coach/opening-lines/${otherUser.id}`)
      console.log('Opening lines response:', response.data)
      const suggestions = response.data.suggestions
      if (suggestions && suggestions.length > 0) {
        setInput(suggestions[0])
        console.log('Set opening line:', suggestions[0])
      } else {
        // Fallback suggestions
        setInput('你好！很高兴认识你 😊')
      }
    } catch (error: any) {
      console.error('Failed to get opening lines:', error)
      // Fallback suggestions
      setInput('你好！很高兴认识你 😊')
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800"
        >
          ←
        </button>
        <div className="flex-1">
          <h2 className="font-semibold">{otherUser?.name || '聊天'}</h2>
        </div>
        <button
          onClick={getOpeningLines}
          className="text-2xl"
          title="AI 柴犬建議"
        >
          🐕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">載入中...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={() => router.back()}
                className="text-primary-500 hover:underline"
              >
                返回
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-4">還沒有訊息，開始聊天吧！</p>
              <button
                onClick={getOpeningLines}
                disabled={!otherUser?.id}
                className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🐕 獲取開場白建議
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === user?.id
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isOwn
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
                    {new Date(message.createdAt).toLocaleTimeString('zh-TW', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Always visible at bottom */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="輸入訊息..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || !socket}
            className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            發送
          </button>
        </form>
      </div>
    </div>
  )
}

