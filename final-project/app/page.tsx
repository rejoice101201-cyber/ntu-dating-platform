'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      return; // 等待 session 載入
    }

    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      if (!session?.user?.userID) {
        router.replace('/auth/register');
        return;
      }
      // 如果有 userID，重定向到主應用（由 layout 處理）
      // 不進行重定向，讓 (main) 路由組處理
    }
  }, [status, session, router]);

  // 顯示載入中狀態
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  // 如果已登入且有 userID，重定向到主應用
  if (status === 'authenticated' && session?.user?.userID) {
    // 不渲染任何內容，讓 (main) 路由組處理
    return null;
  }

  // 其他情況顯示載入中
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">載入中...</p>
      </div>
    </div>
  );
}
