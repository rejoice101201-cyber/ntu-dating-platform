'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  userID?: string;
  name?: string;
  email?: string;
  image?: string;
  photos?: string[];
  bio?: string;
  personality?: string[];
  interests?: string[];
  appearance?: string[];
  age?: number;
  location?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    personality: [] as string[],
    interests: [] as string[],
    appearance: [] as string[],
    age: 0,
    location: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && !session?.user?.userID) {
      router.push('/auth/register');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          bio: data.user.bio || '',
          personality: data.user.personality || [],
          interests: data.user.interests || [],
          appearance: data.user.appearance || [],
          age: data.user.age || 0,
          location: data.user.location || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setEditing(false);
        alert('個人資料已更新');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('更新失敗');
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">個人資料</h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                編輯
              </button>
            )}
          </div>

          {/* 照片 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">照片</h2>
            {user.photos && user.photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {user.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">還沒有照片</p>
            )}
          </div>

          {/* 基本資訊 */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UserID
              </label>
              <p className="text-gray-800">{user.userID}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-800">{user.name || '未設定'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                自我介紹
              </label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                />
              ) : (
                <p className="text-gray-800">{user.bio || '未設定'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                年齡
              </label>
              {editing ? (
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-800">{user.age || '未設定'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                地點
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-800">{user.location || '未設定'}</p>
              )}
            </div>
          </div>

          {/* 標籤 */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                個性標籤
              </label>
              {user.personality && user.personality.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.personality.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">還沒有個性標籤</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                興趣標籤
              </label>
              {user.interests && user.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">還沒有興趣標籤</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                外貌標籤
              </label>
              {user.appearance && user.appearance.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.appearance.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">還沒有外貌標籤</p>
              )}
            </div>
          </div>

          {editing && (
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                儲存
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  fetchProfile(); // 重置表單
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




