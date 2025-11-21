'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MatchCard from '@/components/match/MatchCard';

interface Recommendation {
  _id: string;
  userID: string;
  name?: string;
  bio?: string;
  personality?: string[];
  interests?: string[];
  appearance?: string[];
  age?: number;
  location?: string;
  score: number;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && !session?.user?.userID) {
      router.push('/auth/register');
    } else if (status === 'authenticated') {
      fetchRecommendations();
    }
  }, [status, session, router]);

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/match/recommendations');
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (userId: string) => {
    try {
      const res = await fetch('/api/match/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchedUserId: userId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isMutualMatch) {
          alert('配對成功！你們可以開始聊天了！');
        }
        // 移除當前卡片，顯示下一個
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const handlePass = async (userId: string) => {
    try {
      await fetch('/api/match/pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchedUserId: userId }),
      });
      // 移除當前卡片，顯示下一個
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to pass:', error);
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

  if (recommendations.length === 0 || currentIndex >= recommendations.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🐕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">沒有更多推薦了</h2>
          <p className="text-gray-600">稍後再來看看吧！</p>
        </div>
      </div>
    );
  }

  const currentUser = recommendations[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <MatchCard
          user={currentUser}
          onLike={() => handleLike(currentUser._id)}
          onPass={() => handlePass(currentUser._id)}
        />
      </div>
    </div>
  );
}




