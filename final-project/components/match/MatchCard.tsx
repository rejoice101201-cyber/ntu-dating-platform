'use client';

interface MatchCardProps {
  user: {
    _id: string;
    userID: string;
    name?: string;
    bio?: string;
    personality?: string[];
    interests?: string[];
    appearance?: string[];
    age?: number;
    location?: string;
  };
  onLike: () => void;
  onPass: () => void;
}

export default function MatchCard({ user, onLike, onPass }: MatchCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* 階段一：隱藏照片，顯示模糊的頭像 */}
      <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gray-400 rounded-full blur-2xl opacity-50" />
        </div>
        <div className="text-6xl z-10">👤</div>
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          階段一
        </div>
      </div>

      <div className="p-6">
        {/* 用戶資訊 */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {user.name || user.userID}
          </h2>
          {user.age && (
            <p className="text-gray-600">{user.age} 歲</p>
          )}
          {user.location && (
            <p className="text-gray-600">{user.location}</p>
          )}
        </div>

        {/* 自我介紹 */}
        {user.bio && (
          <p className="text-gray-700 mb-4">{user.bio}</p>
        )}

        {/* 標籤 */}
        <div className="space-y-3 mb-6">
          {user.personality && user.personality.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">個性</h3>
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
            </div>
          )}

          {user.interests && user.interests.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">興趣</h3>
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
            </div>
          )}

          {user.appearance && user.appearance.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">外貌</h3>
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
            </div>
          )}
        </div>

        {/* 操作按鈕 */}
        <div className="flex gap-4">
          <button
            onClick={onPass}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            跳過
          </button>
          <button
            onClick={onLike}
            className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
          >
            喜歡
          </button>
        </div>
      </div>
    </div>
  );
}




