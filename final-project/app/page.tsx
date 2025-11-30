'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && !session?.user?.userID) {
      router.push('/auth/register');
    } else if (status === 'authenticated' && session?.user?.userID) {
      // 如果已經登入且有 userID，保持在同一頁面（由 layout 處理）
      // 不進行重定向，避免循環
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

  // 如果已登入且有 userID，重定向到主應用（由 layout 處理）
  if (status === 'authenticated' && session?.user?.userID) {
    return null; // 讓 layout 處理重定向
  }

  return null;
}
