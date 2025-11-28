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
      // 如果已經登入且有 userID，重定向到主應用頁面
      router.push('/');
    }
  }, [status, session, router]);

  // 顯示載入中狀態
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">載入中...</p>
      </div>
    </div>
  );
}
