'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { pusherClient } from '@/lib/pusher-client';

interface Message {
  _id: string;
  senderId: {
    _id: string;
    userID: string;
    name?: string;
    image?: string;
  };
  content: string;
  type: string;
  createdAt: Date;
}

interface Chat {
  _id: string;
  participant: {
    _id: string;
    userID: string;
    name?: string;
    image?: string;
  };
  createdAt: Date;
  lastMessageAt?: Date;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const chatId = params.chatId as string;
  const hasRealPusher =
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY &&
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY !== 'dummy';

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && !session?.user?.userID) {
      router.push('/auth/register');
    } else if (status === 'authenticated') {
      fetchChat();
      setupPusher();
      // If no real pusher config, start lightweight polling as fallback
      if (!hasRealPusher && !pollRef.current) {
        pollRef.current = setInterval(() => {
          fetchChat(false);
        }, 4000);
      }
    }

    return () => {
      // 清理 Pusher 訂閱
      if (chatId) {
        pusherClient.unsubscribe(`chat-${chatId}`);
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [status, session, router, chatId, hasRealPusher]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChat = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch(`/api/chat/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setChat(data.chat);
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupPusher = () => {
    if (!hasRealPusher) return;
    if (!chatId || !session?.user?.id) return;

    try {
      const channel = pusherClient.subscribe(`chat-${chatId}`);
      // 避免重複綁定造成訊息重複
      channel.unbind('new-message');

      channel.bind('new-message', (data: any) => {
        // 確保訊息格式正確
        const newMessage: Message = {
          _id: data._id,
          senderId: data.senderId,
          content: data.content,
          type: data.type || 'text',
          createdAt: new Date(data.createdAt),
        };
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c35992e1-5f2f-4cd5-beb1-b43e292cbe5b',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            sessionId:'debug-session',
            runId:'pre-fix',
            hypothesisId:'H1',
            location:'app/(main)/chat/[chatId]/page.tsx:pusher-new-message',
            message:'pusher new-message',
            data:{incomingId:newMessage._id},
            timestamp:Date.now()
          })
        }).catch(()=>{});
        // #endregion
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
      });

      return () => {
        channel.unbind('new-message');
      };
    } catch (error) {
      console.error('Pusher setup error:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message.trim(), type: 'text' }),
      });

      if (res.ok) {
        const data = await res.json();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c35992e1-5f2f-4cd5-beb1-b43e292cbe5b',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            sessionId:'debug-session',
            runId:'pre-fix',
            hypothesisId:'H2',
            location:'app/(main)/chat/[chatId]/page.tsx:handleSend-response',
            message:'api response message',
            data:{messageId:data?.message?._id},
            timestamp:Date.now()
          })
        }).catch(()=>{});
        // #endregion
        setMessage('');
        // 交由 Pusher 來即時新增訊息；同時保險重拉一次避免漏事件
        fetchChat(false);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">聊天室不存在</p>
      </div>
    );
  }

  const currentUserId = session?.user?.id;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-yellow-500 text-white p-4 flex items-center gap-4">
        <button
          onClick={() => router.push('/chat')}
          className="text-white hover:text-gray-200"
        >
          ←
        </button>
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
          {chat.participant.image ? (
            <img
              src={chat.participant.image}
              alt={chat.participant.userID}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-xl">👤</span>
          )}
        </div>
        <div>
          <h1 className="font-semibold">
            {chat.participant.name || chat.participant.userID}
          </h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.senderId._id === currentUserId;
          return (
            <div
              key={msg._id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isOwn ? 'text-yellow-100' : 'text-gray-500'
                  }`}
                >
                  {format(new Date(msg.createdAt), 'HH:mm', { locale: zhTW })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="輸入訊息..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            發送
          </button>
        </div>
      </form>
    </div>
  );
}

