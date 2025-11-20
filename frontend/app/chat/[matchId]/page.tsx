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
  const [gameSession, setGameSession] = useState<any>(null)
  const [gameTopic, setGameTopic] = useState<string>('')
  const [gameAnswer, setGameAnswer] = useState<string>('')
  const [gameGuess, setGameGuess] = useState<string>('')
  const [unlockProgress, setUnlockProgress] = useState<any>(null)
  const [keys, setKeys] = useState(0)
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
              userName: otherUserData.name,
              photos: profileResponse.data.photos,
              photosCount: profileResponse.data.photos?.length || 0,
              unlockProgress: profileResponse.data.unlockProgress,
            })
            setOtherUser(profileResponse.data)
            setUnlockProgress(profileResponse.data.unlockProgress)
            setKeys(profileResponse.data.unlockProgress?.keys || 0)
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
      setKeys(response.data.unlockProgress?.keys || 0)
    } catch (error) {
      console.error('Failed to load other user profile:', error)
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
              // 如果关闭游戏面板，重置游戏状态
              if (!showQAGame) {
                // 可以在这里检查是否有进行中的游戏
              } else {
                // 关闭时重置
                setGameSession(null)
                setGameAnswer('')
                setGameGuess('')
              }
            }}
            className="text-2xl hover:scale-110 transition-transform"
            title="默契問答遊戲"
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
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-b-4 border-pink-200 p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              🎮 默契問答遊戲
            </h3>
            <button
              onClick={() => {
                setShowQAGame(false)
                setGameSession(null)
                setGameAnswer('')
                setGameGuess('')
              }}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>
          
          {unlockProgress && (
            <div className="mb-3 space-y-2 bg-white rounded-lg p-3 border-2 border-pink-200">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                <div
                  className="bg-gradient-to-r from-pink-400 to-purple-400 h-3 rounded-full transition-all"
                  style={{ width: `${unlockProgress.unlockLevel}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-gray-700">解鎖進度: {unlockProgress.unlockLevel}%</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-yellow-600 font-bold">🔑 {keys} 把鑰匙</span>
                  {keys > 0 && (
                    <button
                      onClick={useKeyToUnlock}
                      className="text-xs bg-gradient-to-r from-pink-400 to-purple-400 text-white px-3 py-1 rounded-full hover:from-pink-500 hover:to-purple-500 transition-all shadow-md"
                    >
                      使用鑰匙解鎖
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {!gameSession ? (
            // 选择主题发起游戏
            <div className="space-y-3">
              <p className="text-gray-700 font-semibold mb-3">選擇一個主題來發起遊戲：</p>
              <div className="grid grid-cols-2 gap-3">
                {['interest', 'personality', 'lifestyle', 'icebreaker'].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => initiateGame(topic)}
                    className="bg-white border-2 border-pink-200 rounded-xl p-4 hover:border-pink-400 hover:shadow-lg transition-all text-left"
                  >
                    <div className="text-2xl mb-1">
                      {topic === 'interest' && '🎨'}
                      {topic === 'personality' && '🌟'}
                      {topic === 'lifestyle' && '🏠'}
                      {topic === 'icebreaker' && '💬'}
                    </div>
                    <div className="font-semibold text-sm">
                      {topic === 'interest' && '興趣'}
                      {topic === 'personality' && '個性'}
                      {topic === 'lifestyle' && '生活方式'}
                      {topic === 'icebreaker' && '破冰'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : gameSession.status === 'waiting_answer' && gameSession.responderId === user?.id ? (
            // 回答者：回答问题
            <div className="space-y-3 bg-white rounded-lg p-4 border-2 border-purple-200">
              <p className="text-sm text-gray-600 mb-2">對方選擇了主題：<span className="font-semibold">{gameSession.topic}</span></p>
              {gameSession.question && (
                <>
                  <p className="font-semibold text-lg mb-3">{gameSession.question.content}</p>
                  {gameSession.question.type === 'multiple_choice' && gameSession.question.options ? (
                    <div className="space-y-2">
                      {JSON.parse(gameSession.question.options).map((opt: string, idx: number) => (
                        <label key={idx} className="flex items-center p-3 bg-pink-50 rounded-lg hover:bg-pink-100 cursor-pointer border-2 border-transparent hover:border-pink-300 transition-all">
                          <input
                            type="radio"
                            name="gameAnswer"
                            value={opt}
                            checked={gameAnswer === opt}
                            onChange={(e) => setGameAnswer(e.target.value)}
                            className="mr-3"
                          />
                          <span className="font-medium">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={gameAnswer}
                      onChange={(e) => setGameAnswer(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:border-pink-400 focus:outline-none"
                      placeholder="輸入你的答案"
                    />
                  )}
                  <button
                    onClick={submitAnswer}
                    disabled={!gameAnswer}
                    className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white py-3 rounded-full font-bold hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    提交答案
                  </button>
                </>
              )}
            </div>
          ) : gameSession.status === 'waiting_guess' && gameSession.initiatorId === user?.id ? (
            // 发起者：猜测答案
            <div className="space-y-3 bg-white rounded-lg p-4 border-2 border-purple-200">
              <p className="text-sm text-gray-600 mb-2">對方已回答，現在輪到你猜測答案！</p>
              <p className="font-semibold text-lg mb-3">{gameSession.question?.content}</p>
              {gameSession.question?.type === 'multiple_choice' && gameSession.question?.options ? (
                <div className="space-y-2">
                  {JSON.parse(gameSession.question.options).map((opt: string, idx: number) => (
                    <label key={idx} className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 cursor-pointer border-2 border-transparent hover:border-purple-300 transition-all">
                      <input
                        type="radio"
                        name="gameGuess"
                        value={opt}
                        checked={gameGuess === opt}
                        onChange={(e) => setGameGuess(e.target.value)}
                        className="mr-3"
                      />
                      <span className="font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={gameGuess}
                  onChange={(e) => setGameGuess(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="猜測對方的答案"
                />
              )}
              <button
                onClick={submitGuess}
                disabled={!gameGuess}
                className="w-full bg-gradient-to-r from-purple-400 to-pink-400 text-white py-3 rounded-full font-bold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交猜測
              </button>
            </div>
          ) : gameSession.status === 'completed' ? (
            // 游戏完成
            <div className="bg-white rounded-lg p-4 border-2 border-green-200 text-center">
              <div className="text-4xl mb-2">
                {gameSession.winnerId === user?.id ? '🎉' : '😊'}
              </div>
              <p className="font-bold text-lg mb-2">
                {gameSession.winnerId === user?.id 
                  ? '恭喜！你獲得一把鑰匙！' 
                  : '對方獲得一把鑰匙'}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                正確答案：{gameSession.responderAnswer}
              </p>
              <button
                onClick={() => {
                  setGameSession(null)
                  setGameAnswer('')
                  setGameGuess('')
                }}
                className="bg-gradient-to-r from-pink-400 to-purple-400 text-white px-6 py-2 rounded-full font-semibold hover:from-pink-500 hover:to-purple-500 transition-all"
              >
                再玩一次
              </button>
            </div>
          ) : (
            // 等待对方操作
            <div className="bg-white rounded-lg p-4 border-2 border-yellow-200 text-center">
              <div className="text-3xl mb-2">⏳</div>
              <p className="font-semibold">等待對方操作...</p>
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

