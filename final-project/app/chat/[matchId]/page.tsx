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
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
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
    
    // Load current user's profile to get photos
    if (user?.id) {
      loadCurrentUserProfile(user.id)
    }
    
    // 检查是否有活跃的游戏会话
    checkActiveGameSession()

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
        
        // 监听游戏状态更新
        channel.bind('game_state_update', (data: any) => {
          console.log('Game state update received:', data)
          if (data.gameSession) {
            console.log('Updating game session:', {
              id: data.gameSession.id,
              status: data.gameSession.status,
              hasQuestion: !!data.gameSession.question,
              questionContent: data.gameSession.question?.content,
            })
            setGameSession(data.gameSession)
            // 如果有游戏会话且状态不是completed，自动打开游戏面板
            if (data.gameSession.status !== 'completed') {
              setShowQAGame(true)
            }
            // 如果游戏完成，重新加载解锁进度
            if (data.gameSession.status === 'completed' && otherUser?.id) {
              loadOtherUserProfile(otherUser.id)
            }
          }
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
      // Set up polling to check for new messages and game state periodically
      const pollInterval = setInterval(() => {
        if (!isInitialLoad) {
          loadMessages(false) // Don't show loading spinner on polling
          checkActiveGameSession() // 检查游戏状态
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
      
      console.log('Loading messages for match:', matchId)
      const response = await api.get(`/chat/${matchId}`)
      console.log('Messages response:', response.data)
      setMessages(response.data.messages || [])

      // Get match info to find other user (only on initial load)
      if (isInitialLoad) {
        console.log('Loading match info for initial load')
        const matchResponse = await api.get('/matches')
        console.log('Matches response:', matchResponse.data)
        const match = matchResponse.data.matches?.find((m: any) => m.id === matchId)
        if (match) {
          // Use 'user' instead of 'otherUser' based on API response structure
          const otherUserData = match.user || match.otherUser
          if (otherUserData) {
            console.log('Loading profile for other user:', otherUserData.id)
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
            setKeys(profileResponse.data.unlockProgress?.keys || 0)
          } else {
            console.error('No otherUserData found in match:', match)
            setError('找不到配對用戶資訊')
          }
        } else {
          console.error('Match not found in matches list:', matchId)
          setError('找不到配對資訊')
        }
        setIsInitialLoad(false)
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      setError(error.response?.data?.error || error.message || '載入訊息失敗')
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

  const loadCurrentUserProfile = async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`)
      console.log('Loaded current user profile:', response.data)
      setCurrentUserProfile(response.data)
    } catch (error) {
      console.error('Failed to load current user profile:', error)
    }
  }

  // 检查活跃的游戏会话
  const checkActiveGameSession = async () => {
    try {
      const response = await api.get(`/game/active/${matchId}`)
      if (response.data.gameSession) {
        console.log('Found active game session:', {
          id: response.data.gameSession.id,
          status: response.data.gameSession.status,
          hasQuestion: !!response.data.gameSession.question,
          questionContent: response.data.gameSession.question?.content,
          questionId: response.data.gameSession.questionId,
        })
        setGameSession(response.data.gameSession)
        // 如果游戏面板未打开且游戏未完成，自动打开
        if (!showQAGame && response.data.gameSession.status !== 'completed') {
          setShowQAGame(true)
        }
      } else {
        // 如果没有活跃的游戏会话，清除状态
        if (gameSession && gameSession.status === 'completed') {
          setGameSession(null)
          setGameAnswer('')
          setGameGuess('')
        }
      }
    } catch (error) {
      console.error('Failed to check active game session:', error)
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

  // 发起游戏
  const initiateGame = async (topic: string) => {
    try {
      console.log('Initiating game with topic:', topic, 'matchId:', matchId)
      const response = await api.post('/game/initiate', {
        matchId,
        topic,
      })
      console.log('Game initiated successfully:', response.data)
      
      if (!response.data.gameSession || !response.data.gameSession.question) {
        console.error('Game session created but no question assigned:', response.data)
        alert('遊戲已發起，但沒有找到題目。請稍後再試或聯繫客服。')
        return
      }
      
      setGameSession(response.data.gameSession)
      setGameTopic(topic)
      setShowQAGame(true)
      // API已经通过Pusher通知对方，这里不需要额外操作
    } catch (error: any) {
      console.error('Failed to initiate game:', error)
      const errorMessage = error.response?.data?.error || '發起遊戲失敗'
      console.error('Error details:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      })
      alert(`發起遊戲失敗：${errorMessage}`)
    }
  }

  // 回答问题（回答者）
  const submitAnswer = async () => {
    if (!gameSession || !gameAnswer) return
    
    try {
      const response = await api.post('/game/answer', {
        gameSessionId: gameSession.id,
        answer: gameAnswer,
      })
      setGameSession(response.data.gameSession)
      alert('答案已提交！等待對方猜測...')
      // API已经通过Pusher通知对方，这里不需要额外操作
    } catch (error: any) {
      console.error('Failed to submit answer:', error)
      alert(error.response?.data?.error || '提交答案失敗')
    }
  }

  // 猜测答案（发起者）
  const submitGuess = async () => {
    if (!gameSession || !gameGuess) return
    
    try {
      const response = await api.post('/game/guess', {
        gameSessionId: gameSession.id,
        guess: gameGuess,
      })
      setGameSession(response.data.gameSession)
      if (response.data.isCorrect) {
        alert('🎉 猜對了！你獲得一把鑰匙！')
      } else {
        alert('😅 猜錯了，對方獲得一把鑰匙')
      }
      // 重新加载解锁进度
      if (otherUser?.id) {
        await loadOtherUserProfile(otherUser.id)
      }
      // API已经通过Pusher通知对方，这里不需要额外操作
    } catch (error: any) {
      console.error('Failed to submit guess:', error)
      alert(error.response?.data?.error || '提交猜測失敗')
    }
  }

  // 使用钥匙解锁照片
  const useKeyToUnlock = async () => {
    if (!otherUser?.id || keys < 1) {
      alert('鑰匙不足！')
      return
    }
    
    try {
      const response = await api.post('/game/unlock', {
        targetUserId: otherUser.id,
      })
      setUnlockProgress(response.data.unlockProgress)
      setKeys(response.data.unlockProgress.keys)
      alert('🎉 使用一把鑰匙，解鎖進度 +20%！')
      // 重新加载用户资料以更新照片模糊级别
      if (otherUser?.id) {
        await loadOtherUserProfile(otherUser.id)
      }
    } catch (error: any) {
      console.error('Failed to unlock:', error)
      alert(error.response?.data?.error || '解鎖失敗')
    }
  }

  return (
    <div className="flex flex-col h-screen relative">
      {/* Header */}
      <div className="bg-[var(--pixel-panel)] border-b-3 border-[var(--pixel-border)] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-[var(--pixel-text-dim)] hover:text-[var(--pixel-text)]"
        >
          ←
        </button>
        <div className="flex-1">
          <h2 className="font-semibold text-[var(--pixel-text)]">{otherUser?.name || 'Chat'}</h2>
          {unlockProgress && (
            <p className="text-xs text-[var(--pixel-text-dim)]">Unlock: {unlockProgress.unlockLevel}%</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (!showQAGame) {
                // 打开游戏面板时，先检查是否有活跃的游戏会话
                await checkActiveGameSession()
              }
              setShowQAGame(!showQAGame)
              // 如果关闭游戏面板且游戏已完成，重置游戏状态
              if (showQAGame && gameSession?.status === 'completed') {
                setGameSession(null)
                setGameAnswer('')
                setGameGuess('')
              }
            }}
            className="text-2xl hover:scale-110 transition-transform"
            title="Q&A game"
          >
            🎮
          </button>
          <button
            onClick={getOpeningLines}
            className="text-2xl"
            title="AI coach"
          >
            🐕
          </button>
        </div>
      </div>

      {/* Q&A Game Panel */}
      {showQAGame && otherUser && (
        <div className="bg-[var(--pixel-surface)] border-b-3 border-[var(--pixel-border)] p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3 text-[var(--pixel-text)]">
            <h3 className="font-bold text-lg">🎮 Q&A game</h3>
            <button
              onClick={() => {
                setShowQAGame(false)
                setGameSession(null)
                setGameAnswer('')
                setGameGuess('')
              }}
              className="text-xl px-2 py-1 border-3 border-[var(--pixel-border)] bg-[var(--pixel-panel)] shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:-translate-y-0.5 transition-transform"
            >
              ✕
            </button>
          </div>
          
          {unlockProgress && (
            <div className="mb-3 space-y-2 pixel-panel p-3 text-[var(--pixel-text)]">
              <div className="w-full bg-[#d9dce1] h-3 mb-1">
                <div
                  className="h-3"
                  style={{ width: `${unlockProgress.unlockLevel}%`, backgroundColor: 'var(--pixel-highlight)' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-[var(--pixel-text)]">Unlock: {unlockProgress.unlockLevel}%</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-yellow-600 font-bold">🔑 {keys} keys</span>
                  {keys > 0 && (
                    <button
                      onClick={useKeyToUnlock}
                      className="text-xs bg-[var(--pixel-highlight)] text-white px-3 py-1 border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)]"
                    >
                      Use key
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {!gameSession ? (
            <div className="space-y-3">
              <p className="text-[var(--pixel-text)] font-semibold mb-3">Pick a topic to start:</p>
              <div className="grid grid-cols-2 gap-3">
                {['interest', 'personality', 'lifestyle', 'icebreaker'].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => initiateGame(topic)}
                    className="pixel-panel p-4 text-left hover:-translate-y-0.5 transition-transform text-[var(--pixel-text)]"
                  >
                    <div className="text-2xl mb-1">
                      {topic === 'interest' && '🎨'}
                      {topic === 'personality' && '🌟'}
                      {topic === 'lifestyle' && '🏠'}
                      {topic === 'icebreaker' && '💬'}
                    </div>
                    <div className="font-semibold text-sm uppercase">{topic}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : gameSession.status === 'waiting_answer' && gameSession.responderId === user?.id ? (
            <div className="space-y-3 pixel-panel p-4 text-[var(--pixel-text)]">
              <p className="text-sm text-[var(--pixel-text-dim)] mb-2">
                Topic chosen: <span className="font-semibold text-[var(--pixel-text)]">{gameSession.topic}</span>
              </p>
              {gameSession.question ? (
                <>
                  <p className="font-semibold text-lg mb-3">{gameSession.question.content}</p>
                  {gameSession.question.type === 'multiple_choice' && gameSession.question.options ? (
                    <div className="space-y-2">
                      {JSON.parse(gameSession.question.options).map((opt: string, idx: number) => (
                        <label
                          key={idx}
                          className="flex items-center p-3 bg-[var(--pixel-surface)] cursor-pointer border-3 border-[var(--pixel-border)] hover:-translate-y-0.5 transition-transform text-[var(--pixel-text)]"
                        >
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
                      className="w-full"
                      placeholder="Your answer"
                    />
                  )}
                  <button onClick={submitAnswer} disabled={!gameAnswer} className="w-full text-[var(--pixel-text)]">
                    Submit answer
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[var(--pixel-text-dim)] mb-2">Loading question...</p>
                  <button onClick={checkActiveGameSession} className="underline text-sm text-[var(--pixel-text)]">
                    Reload
                  </button>
                </div>
              )}
            </div>
          ) : gameSession.status === 'waiting_guess' && gameSession.initiatorId === user?.id ? (
            <div className="space-y-3 pixel-panel p-4 text-[var(--pixel-text)]">
              <p className="text-sm text-[var(--pixel-text-dim)] mb-2">They answered, your turn to guess!</p>
              <p className="font-semibold text-lg mb-3">{gameSession.question?.content}</p>
              {gameSession.question?.type === 'multiple_choice' && gameSession.question?.options ? (
                <div className="space-y-2">
                  {JSON.parse(gameSession.question.options).map((opt: string, idx: number) => (
                    <label
                      key={idx}
                      className="flex items-center p-3 bg-[var(--pixel-surface)] cursor-pointer border-3 border-[var(--pixel-border)] hover:-translate-y-0.5 transition-transform text-[var(--pixel-text)]"
                    >
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
                  className="w-full"
                  placeholder="Your guess"
                />
              )}
              <button onClick={submitGuess} disabled={!gameGuess} className="w-full text-[var(--pixel-text)]">
                Submit guess
              </button>
            </div>
          ) : gameSession.status === 'completed' ? (
            <div className="pixel-panel p-4 text-center text-[var(--pixel-text)]">
              <div className="text-4xl mb-2">
                {gameSession.winnerId === user?.id ? '🎉' : '💪'}
              </div>
              <p className="font-bold text-lg mb-2">
                {gameSession.winnerId === user?.id ? 'You earned a key!' : 'Next time!'}
              </p>
              <p className="text-sm text-[var(--pixel-text-dim)] mb-3">
                Correct answer: {gameSession.responderAnswer}
              </p>
              <button
                onClick={() => {
                  setGameSession(null)
                  setGameAnswer('')
                  setGameGuess('')
                }}
                className="px-6 py-2"
              >
                Play again
              </button>
            </div>
          ) : (
            <div className="pixel-panel p-4 text-center">
              <div className="text-3xl mb-2">⏳</div>
              <p className="font-semibold">Waiting for the other side...</p>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[var(--pixel-text-dim)]">Loading...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={() => router.back()}
                className="underline text-[var(--pixel-text)]"
              >
                Back
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-[var(--pixel-text-dim)] mb-4">No messages yet. Say hi!</p>
              <button
                onClick={getOpeningLines}
                disabled={!otherUser?.id}
                className="px-4 py-2 border-3 border-[var(--pixel-border)] bg-[var(--pixel-panel)] shadow-[4px_4px_0_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🐕 Get opener
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
                    onClick={() => otherUser?.id && router.push(`/profile/${otherUser.id}?matchId=${matchId}`)}
                    className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative"
                  >
                    {senderPhoto?.url ? (
                      <div
                        className="w-full h-full rounded-full"
                        style={{
                          filter: `blur(${blurLevel}px)`,
                          backgroundImage: senderPhoto.url ? `url(${senderPhoto.url})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundColor: senderPhoto.url ? 'transparent' : '#e5e7eb',
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-pink-200 text-pink-600 text-xs font-bold rounded-full">
                        {otherUser?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </button>
                )}
                
                {/* Avatar for own messages */}
                {isOwn && user && (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
                    {(() => {
                      // Get current user's profile photo from loaded profile
                      const coverPhoto = currentUserProfile?.photos?.find((p: any) => p.isCover) || currentUserProfile?.photos?.[0]
                      const currentUserPhoto = coverPhoto?.url
                      if (currentUserPhoto) {
                        return (
                          <div
                            className="w-full h-full rounded-full"
                            style={{
                              backgroundImage: `url(${currentUserPhoto})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                        )
                      }
                      return (
                        <div className="w-full h-full flex items-center justify-center bg-primary-200 text-primary-700 text-xs font-bold rounded-full">
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )
                    })()}
                  </div>
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
                    {new Date(message.createdAt).toLocaleTimeString('en-US', {
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
      <div className="bg-[var(--pixel-panel)] border-t-3 border-[var(--pixel-border)] p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-6 py-2"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

