'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Pusher from 'pusher-js'
import api from '@/lib/api'

interface Message {
  id: string
  content: string
  type: string
  senderId: string
  matchId?: string
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
  const [pusher, setPusher] = useState<Pusher | null>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showQAGame, setShowQAGame] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [unlockProgress, setUnlockProgress] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) {
      router.push('/auth/login')
      return
    }

    // Load messages first (even without Pusher)
    loadMessages(true)

    // Initialize Pusher if environment variables are set
    if (process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      try {
        const newPusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        })

        // Subscribe to match channel
        const channel = newPusher.subscribe(`match-${matchId}`)
        
        channel.bind('new_message', (message: Message) => {
          setMessages(prev => [...prev, message])
        })

        // Also subscribe to user channel for notifications
        if (user) {
          const userChannel = newPusher.subscribe(`user-${user.id}`)
          userChannel.bind('new_message', (message: Message) => {
            if (message.matchId === matchId) {
              setMessages(prev => [...prev, message])
            }
          })
        }

        setPusher(newPusher)

        return () => {
          newPusher.disconnect()
        }
      } catch (error) {
        console.error('Failed to initialize Pusher:', error)
        // Continue without Pusher - messages will still work via API polling
      }
    } else {
      console.warn('Pusher environment variables not set - real-time updates disabled')
      // Set up polling to check for new messages periodically (only after initial load)
      const pollInterval = setInterval(() => {
        if (!isInitialLoad) {
          loadMessages(false) // Don't show loading spinner on polling
        }
      }, 5000) // Poll every 5 seconds

      return () => {
        clearInterval(pollInterval)
      }
    }
  }, [matchId, token, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)
      
      const response = await api.get(`/chat/${matchId}`)
      setMessages(response.data.messages || [])

      // Get match info to find other user (only on initial load)
      if (isInitialLoad) {
        const matchResponse = await api.get('/matches')
        const match = matchResponse.data.matches.find((m: any) => m.id === matchId)
        if (match) {
          // Use 'user' instead of 'otherUser' based on API response structure
          const otherUserData = match.user || match.otherUser
          if (otherUserData) {
            // Load full profile to get all photos with blur levels
            const profileResponse = await api.get(`/users/${otherUserData.id}`)
            console.log('Loaded other user profile in chat:', {
              userId: otherUserData.id,
              userName: profileResponse.data.name,
              photos: profileResponse.data.photos,
              photosCount: profileResponse.data.photos?.length || 0,
              unlockProgress: profileResponse.data.unlockProgress,
            })
            setOtherUser(profileResponse.data)
            setUnlockProgress(profileResponse.data.unlockProgress)
          } else {
            setError('找不到配對用戶資訊')
          }
        } else {
          setError('找不到配對資訊')
        }
        setIsInitialLoad(false)
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error)
      setError(error.response?.data?.error || '載入訊息失敗')
      if (error.response?.status === 404) {
        setError('配對不存在')
      }
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user) return

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

    try {
      // Send via API (which will trigger Pusher)
      const response = await api.post(`/chat/${matchId}`, {
        content: messageContent,
        type: 'text',
      })
      
      // Replace temp message with real message
      if (response.data.message) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? response.data.message : msg
        ))
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
    }
  }

  const loadOtherUserProfile = async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`)
      console.log('Loaded other user profile:', response.data)
      setOtherUser(response.data)
      setUnlockProgress(response.data.unlockProgress)
    } catch (error) {
      console.error('Failed to load other user profile:', error)
    }
  }

  const loadQuestions = async () => {
    try {
      const response = await api.get('/qa/questions?limit=5')
      const questionsData = response.data.questions || []
      setQuestions(questionsData)
      if (questionsData.length > 0) {
        setSelectedQuestions(questionsData.slice(0, 3).map((q: any) => q.id))
      }
    } catch (error) {
      console.error('Failed to load questions:', error)
      setQuestions([])
    }
  }

  const handlePlayQA = async () => {
    if (!otherUser?.id || selectedQuestions.length === 0) return

    try {
      const answerArray = selectedQuestions.map(qId => answers[qId] || '')
      const response = await api.post(`/qa/play/${otherUser.id}`, {
        questionIds: selectedQuestions,
        answers: answerArray,
      })

      alert(`匹配度: ${response.data.matchPercentage}%！解鎖進度: ${response.data.unlockProgress.unlockLevel}%`)
      setShowQAGame(false)
      setAnswers({})
      // Reload profile to update unlock progress
      await loadOtherUserProfile(otherUser.id)
    } catch (error: any) {
      if (error.response?.data?.error?.includes('energy')) {
        alert('體力不足！')
      } else {
        alert('問答遊戲失敗，請重試')
      }
    }
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
        setInput('你好！很高興認識你 😊')
      }
    } catch (error: any) {
      console.error('Failed to get opening lines:', error)
      // Fallback suggestions
      setInput('你好！很高興認識你 😊')
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
          {unlockProgress && (
            <p className="text-xs text-gray-500">解鎖進度: {unlockProgress.unlockLevel}%</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowQAGame(!showQAGame)
              if (!showQAGame && questions.length === 0) {
                loadQuestions()
              }
            }}
            className="text-xl"
            title="問答遊戲解鎖照片"
          >
            🎮
          </button>
          <button
            onClick={getOpeningLines}
            className="text-2xl"
            title="AI 柴犬建議"
          >
            🐕
          </button>
        </div>
      </div>

      {/* Q&A Game Panel */}
      {showQAGame && otherUser && (
        <div className="bg-white border-b p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">🐕 問答遊戲 - 解鎖照片</h3>
            <button
              onClick={() => setShowQAGame(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {unlockProgress && (
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${unlockProgress.unlockLevel}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">解鎖進度: {unlockProgress.unlockLevel}%</p>
            </div>
          )}
          {questions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">載入問題中...</p>
              <button
                onClick={loadQuestions}
                className="text-primary-500 hover:underline text-sm"
              >
                重新載入
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedQuestions.map((qId) => {
                const question = questions.find((q) => q.id === qId)
                if (!question) return null

                return (
                  <div key={qId} className="border rounded-lg p-3 bg-gray-50">
                    <p className="font-medium mb-2 text-sm">{question.content}</p>
                    {question.type === 'multiple_choice' && question.options ? (
                      <div className="space-y-1">
                        {JSON.parse(question.options).map((opt: string, idx: number) => (
                          <label key={idx} className="flex items-center text-sm">
                            <input
                              type="radio"
                              name={`q-${qId}`}
                              value={opt}
                              checked={answers[qId] === opt}
                              onChange={(e) =>
                                setAnswers({ ...answers, [qId]: e.target.value })
                              }
                              className="mr-2"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={answers[qId] || ''}
                        onChange={(e) =>
                          setAnswers({ ...answers, [qId]: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="輸入答案"
                      />
                    )}
                  </div>
                )
              })}
              <button
                onClick={handlePlayQA}
                disabled={selectedQuestions.some(qId => !answers[qId])}
                className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                提交答案並解鎖
              </button>
            </div>
          )}
        </div>
      )}

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
            // Find cover photo or first photo for other user - 完全按照资料页面的方式
            let senderPhoto = null
            let blurLevel = 20
            
            if (!isOwn && otherUser?.photos && otherUser.photos.length > 0) {
              senderPhoto = otherUser.photos.find((p: any) => p.isCover) || otherUser.photos[0]
              blurLevel = senderPhoto?.blurLevel ?? 20
            }
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}
              >
                {/* Avatar for other user's messages */}
                {!isOwn && (
                  <button
                    onClick={() => otherUser?.id && router.push(`/profile/${otherUser.id}`)}
                    className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 relative"
                  >
                    {senderPhoto?.url ? (
                      <div
                        className="w-full h-full rounded-full"
                        style={{
                          filter: `blur(${blurLevel}px)`,
                          backgroundImage: `url(${senderPhoto.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-pink-200 text-pink-600 text-xs font-bold">
                        {otherUser?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </button>
                )}
                
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
            disabled={!input.trim()}
            className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            發送
          </button>
        </form>
      </div>
    </div>
  )
}

