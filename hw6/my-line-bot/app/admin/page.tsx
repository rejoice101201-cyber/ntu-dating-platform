'use client';

import { useEffect, useState } from 'react';

interface Message {
  id: string;
  content: string;
  role: string;
  messageType: string;
  timestamp: string;
  lineUserId: string;
  metadata?: any;
  conversation: {
    id: string;
    lineUserId: string;
    status: string;
  };
}

interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface Conversation {
  id: string;
  lineUserId: string;
  status: string;
  lastMessageAt: string;
  messages: Message[];
}

export default function AdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'conversations'>('messages');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map());
  
  // 篩選條件
  const [filters, setFilters] = useState({
    userId: '',
    status: '',
    messageType: '',
    role: '',
    timeRange: '24h', // '24h', '7d', '30d', 'all'
  });

  const getTimeRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return undefined;
    }
  };

  const fetchMessages = async (): Promise<Message[]> => {
    try {
      const params = new URLSearchParams({
        limit: '50',
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.messageType && { messageType: filters.messageType }),
        ...(filters.role && { role: filters.role }),
        ...(filters.timeRange !== 'all' && { startDate: getTimeRange(filters.timeRange) || '' }),
      });
      const res = await fetch(`/api/admin/messages?${params}`);
      const data = await res.json();
      return data.messages || [];
    } catch (error) {
      console.error('取得訊息失敗:', error);
      return [];
    }
  };

  const fetchConversations = async (): Promise<Conversation[]> => {
    try {
      const params = new URLSearchParams({
        limit: '20',
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.timeRange !== 'all' && { startDate: getTimeRange(filters.timeRange) || '' }),
      });
      const res = await fetch(`/api/admin/conversations?${params}`);
      const data = await res.json();
      return data.conversations || [];
    } catch (error) {
      console.error('取得對話失敗:', error);
      return [];
    }
  };

  const fetchStats = async (): Promise<any> => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('取得統計失敗:', error);
      return null;
    }
  };

  // 數據比較邏輯
  const hasNewMessages = (old: Message[], new_: Message[]): boolean => {
    if (new_.length === 0) return false;
    if (old.length === 0) return true;
    // 比較最新的訊息 ID 和時間戳
    return new_[0].id !== old[0].id || 
           new_[0].timestamp !== old[0].timestamp;
  };

  const hasNewConversations = (old: Conversation[], new_: Conversation[]): boolean => {
    if (new_.length === 0) return false;
    if (old.length === 0) return true;
    // 比較最新的對話最後更新時間
    return new_[0].lastMessageAt !== old[0].lastMessageAt ||
           new_[0].id !== old[0].id;
  };

  const hasStatsChanged = (old: any, new_: any): boolean => {
    if (!old || !new_) return true;
    return old.totalMessages !== new_.totalMessages ||
           old.recentMessages !== new_.recentMessages ||
           old.activeConversations !== new_.activeConversations ||
           old.totalConversations !== new_.totalConversations;
  };

  // 獲取使用者 Profile
  const fetchUserProfiles = async (userIds: string[]) => {
    const uniqueUserIds = [...new Set(userIds)];
    const profiles = new Map<string, UserProfile>();
    
    // 批次獲取 Profile（避免過多請求）
    const profilePromises = uniqueUserIds.slice(0, 20).map(async (userId) => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/profile`);
        if (res.ok) {
          const profile = await res.json();
          profiles.set(userId, profile);
        }
      } catch (error) {
        // 靜默處理錯誤
        console.warn(`無法獲取使用者 ${userId.substring(0, 20)}... 的 Profile:`, error);
      }
    });

    await Promise.all(profilePromises);
    setUserProfiles((prev) => {
      const newMap = new Map(prev);
      profiles.forEach((profile, userId) => {
        newMap.set(userId, profile);
      });
      return newMap;
    });
  };

  // 初始載入（顯示 loading）
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [messagesData, conversationsData, statsData] = await Promise.all([
        fetchMessages(),
        fetchConversations(),
        fetchStats()
      ]);
      setMessages(messagesData);
      setConversations(conversationsData);
      setStats(statsData);
      setLastUpdateTime(new Date());
      
      // 獲取使用者 Profiles
      const userIds = [
        ...new Set([
          ...messagesData.map((m: Message) => m.lineUserId),
          ...conversationsData.map((c: Conversation) => c.lineUserId),
        ])
      ];
      await fetchUserProfiles(userIds);
    } catch (error) {
      console.error('載入數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 背景靜默刷新（不顯示 loading）
  const fetchAllSilent = async () => {
    if (isUpdating) return; // 防止重複請求
    setIsUpdating(true);
    try {
      const [messagesData, conversationsData, statsData] = await Promise.all([
        fetchMessages(),
        fetchConversations(),
        fetchStats()
      ]);
      
      // 只在有新數據時才更新
      if (hasNewMessages(messages, messagesData)) {
        setMessages(messagesData);
      }
      if (hasNewConversations(conversations, conversationsData)) {
        setConversations(conversationsData);
      }
      if (hasStatsChanged(stats, statsData)) {
        setStats(statsData);
      }
      
      setLastUpdateTime(new Date());
    } catch (error) {
      // 靜默處理錯誤，不影響使用者
      console.error('背景更新失敗:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 初始載入
  useEffect(() => {
    fetchAll();
  }, []);

  // 自動背景刷新
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchAllSilent();
    }, 5000); // 每 5 秒背景更新一次
    
    return () => clearInterval(interval);
  }, [autoRefresh, filters]);

  // 篩選條件變更時重新載入（顯示 loading）
  useEffect(() => {
    if (messages.length > 0 || conversations.length > 0) {
      // 只有在已經有數據時才重新載入（避免初始載入時重複請求）
      fetchAll();
    }
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Line Bot 監控後台</h1>

        {/* 統計資訊 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm">總對話數</div>
              <div className="text-2xl font-bold">{stats.totalConversations}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm">活躍對話</div>
              <div className="text-2xl font-bold">{stats.activeConversations}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm">總訊息數</div>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm">最近 24 小時</div>
              <div className="text-2xl font-bold">{stats.recentMessages}</div>
            </div>
          </div>
        )}

        {/* 控制列 */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'messages'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                訊息列表
              </button>
              <button
                onClick={() => setActiveTab('conversations')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'conversations'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                對話列表
              </button>
            </div>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">自動更新（5秒）</span>
              </label>
              {isUpdating && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="animate-spin">⟳</span>
                  更新中...
                </span>
              )}
              {lastUpdateTime && (
                <span className="text-xs text-gray-400">
                  最後更新: {lastUpdateTime.toLocaleTimeString('zh-TW')}
                </span>
              )}
              <button
                onClick={fetchAll}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? '載入中...' : '手動更新'}
              </button>
            </div>
          </div>

          {/* 篩選條件 */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">使用者 ID</label>
              <input
                type="text"
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                placeholder="輸入使用者 ID"
                className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm"
              />
            </div>
            {activeTab === 'conversations' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">對話狀態</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm"
                >
                  <option value="">全部</option>
                  <option value="active">活躍</option>
                  <option value="ended">已結束</option>
                </select>
              </div>
            )}
            {activeTab === 'messages' && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">訊息類型</label>
                  <select
                    value={filters.messageType}
                    onChange={(e) => setFilters({ ...filters, messageType: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm"
                  >
                    <option value="">全部</option>
                    <option value="text">文字</option>
                    <option value="postback">Postback</option>
                    <option value="template">模板</option>
                    <option value="image">圖片</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">角色</label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm"
                  >
                    <option value="">全部</option>
                    <option value="user">使用者</option>
                    <option value="assistant">Bot</option>
                    <option value="system">系統</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm text-gray-400 mb-1">時間範圍</label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm"
              >
                <option value="24h">最近 24 小時</option>
                <option value="7d">最近 7 天</option>
                <option value="30d">最近 30 天</option>
                <option value="all">全部</option>
              </select>
            </div>
          </div>
        </div>

        {/* 訊息列表 */}
        {activeTab === 'messages' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">最新訊息</h2>
            {loading ? (
              <div className="text-center py-8">載入中...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-400">尚無訊息</div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-900/30 border-l-4 border-blue-500'
                        : msg.role === 'assistant'
                        ? 'bg-green-900/30 border-l-4 border-green-500'
                        : 'bg-gray-700 border-l-4 border-gray-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            msg.role === 'user'
                              ? 'bg-blue-600'
                              : msg.role === 'assistant'
                              ? 'bg-green-600'
                              : 'bg-gray-600'
                          }`}
                        >
                          {msg.role === 'user' ? '使用者' : msg.role === 'assistant' ? 'Bot' : '系統'}
                        </span>
                        <span className="text-xs text-gray-400">{msg.messageType}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(msg.timestamp).toLocaleString('zh-TW')}
                      </span>
                    </div>
                    <div className="text-sm mb-2 break-words">{msg.content}</div>
                    <div className="flex items-center gap-2 mt-2">
                      {userProfiles.get(msg.lineUserId)?.pictureUrl && (
                        <img
                          src={userProfiles.get(msg.lineUserId)!.pictureUrl}
                          alt={userProfiles.get(msg.lineUserId)?.displayName || 'User'}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="text-xs text-gray-500">
                        {userProfiles.get(msg.lineUserId)?.displayName ? (
                          <>
                            <span className="font-semibold text-gray-400">
                              {userProfiles.get(msg.lineUserId)!.displayName}
                            </span>
                            <span className="text-gray-600 ml-2">
                              (ID: {msg.lineUserId.substring(0, 20)}...)
                            </span>
                          </>
                        ) : (
                          <>User ID: {msg.lineUserId.substring(0, 20)}...</>
                        )}
                      </div>
                    </div>
                    {msg.metadata && (
                      <details className="mt-2 text-xs text-gray-400">
                        <summary className="cursor-pointer hover:text-gray-300">Metadata</summary>
                        <pre className="mt-2 p-2 bg-gray-900 rounded overflow-auto max-h-40">
                          {JSON.stringify(msg.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 對話列表 */}
        {activeTab === 'conversations' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">對話列表</h2>
            {loading ? (
              <div className="text-center py-8">載入中...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">尚無對話</div>
            ) : (
              <div className="space-y-4">
                {conversations.map((conv) => (
                  <div key={conv.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            conv.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                          }`}
                        >
                          {conv.status === 'active' ? '活躍' : '已結束'}
                        </span>
                        <div className="flex items-center gap-2">
                          {userProfiles.get(conv.lineUserId)?.pictureUrl && (
                            <img
                              src={userProfiles.get(conv.lineUserId)!.pictureUrl}
                              alt={userProfiles.get(conv.lineUserId)?.displayName || 'User'}
                              className="w-5 h-5 rounded-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <span className="text-sm font-mono">
                            {userProfiles.get(conv.lineUserId)?.displayName || `${conv.lineUserId.substring(0, 20)}...`}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(conv.lastMessageAt).toLocaleString('zh-TW')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      訊息數: {conv.messages.length}
                    </div>
                    {conv.messages.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {conv.messages.slice(0, 3).map((msg) => (
                          <div
                            key={msg.id}
                            className="text-xs bg-gray-600 rounded p-2 truncate"
                          >
                            <span className="font-semibold">
                              {msg.role === 'user' ? '使用者' : 'Bot'}:
                            </span>{' '}
                            {msg.content.substring(0, 100)}
                            {msg.content.length > 100 && '...'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

