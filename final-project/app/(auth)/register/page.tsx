'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { isValidUserID } from '@/lib/utils';

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userID, setUserID] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user?.userID) {
      // 如果已經有 userID，跳轉到首頁
      router.push('/');
    }
  }, [status, session, router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      setError('最多只能上傳 5 張照片');
      return;
    }

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // 創建預覽
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 驗證 userID
    if (!userID.trim()) {
      setError('請輸入 userID');
      return;
    }

    if (!isValidUserID(userID)) {
      setError('userID 必須是 1-15 個字元，只能包含字母、數字和底線');
      return;
    }

    if (photos.length === 0) {
      setError('請至少上傳一張照片');
      return;
    }

    setLoading(true);

    try {
      // 先上傳照片
      const formData = new FormData();
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const uploadResponse = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || '照片上傳失敗');
      }

      const { photoUrls } = await uploadResponse.json();

      // 註冊 userID
      const registerResponse = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: userID.trim(),
          photos: photoUrls,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.error || '註冊失敗');
      }

      // 註冊成功，跳轉到首頁
      router.push('/');
    } catch (err: any) {
      setError(err.message || '註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">完成註冊</h1>
          <p className="text-gray-600">設定您的 userID 並上傳照片</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* UserID 輸入 */}
          <div>
            <label htmlFor="userID" className="block text-sm font-medium text-gray-700 mb-2">
              UserID <span className="text-red-500">*</span>
            </label>
            <input
              id="userID"
              type="text"
              value={userID}
              onChange={(e) => {
                setUserID(e.target.value);
                setError('');
              }}
              placeholder="輸入您的 userID (1-15 字元，字母數字底線)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              maxLength={15}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              1-15 個字元，只能包含字母、數字和底線
            </p>
          </div>

          {/* 照片上傳 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              照片 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-white hover:file:bg-yellow-600"
              />
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">最多上傳 5 張照片</p>
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-white py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '註冊中...' : '完成註冊'}
          </button>
        </form>
      </div>
    </div>
  );
}





