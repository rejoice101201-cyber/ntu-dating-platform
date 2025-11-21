'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: '認證配置錯誤，請聯繫管理員',
    AccessDenied: '拒絕存取',
    Verification: '驗證失敗',
    Default: '登入時發生錯誤',
  };

  const errorMessage = errorMessages[error || ''] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">登入錯誤</h1>
        <p className="text-gray-600 mb-6">{errorMessage}</p>
        <Link
          href="/auth/signin"
          className="inline-block bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
        >
          返回登入頁面
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">載入中...</h1>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}

