'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface Chat {
  _id: string;
  participant: {
    _id: string;
    userID: string;
    name?: string;
    image?: string;
  };
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: Date;
  };
  lastMessageAt: Date;
  createdAt: Date;
}

export default function ChatListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && !session?.user?.userID) {
      router.push('/auth/register');
    } else if (status === 'authenticated') {
      fetchChats();
    }
  }, [status, session, router]);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-500 text-white p-4">
          <h1 className="text-xl font-bold">訊息</h1>
        </div>

        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-600">還沒有任何訊息</p>
          </div>
        ) : (
          <div className="divide-y">
            {chats.map((chat) => (
              <Link
                key={chat._id}
                href={`/chat/${chat._id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    {chat.participant.image ? (
                      <img
                        src={chat.participant.image}
                        alt={chat.participant.userID}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800">
                        {chat.participant.name || chat.participant.userID}
                      </h3>
                      {chat.lastMessageAt && (
                        <span className="text-xs text-gray-500">
                          {format(new Date(chat.lastMessageAt), 'MM/dd HH:mm', {
                            locale: zhTW,
                          })}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




