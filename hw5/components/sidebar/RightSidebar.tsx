"use client"

export function RightSidebar() {
  // Hardcoded mock data for trends
  const trends = [
    {
      type: "promoted",
      title: "全新狼人殺遊戲 黑手黨42",
      subtitle: "1週年紀念超狂獎勵發放中!錯過就虧大了~",
      promotedBy: "【公式】黑手黨42",
    },
    {
      type: "trending",
      location: "Trending in Taiwan",
      hashtag: "Asia",
      postCount: "166K",
    },
    {
      type: "trending",
      location: "Music · Trending",
      hashtag: "#CORTIS",
      postCount: "86.4K",
    },
    {
      type: "trending",
      location: "Trending in Taiwan",
      hashtag: "#LMSY",
      postCount: "139K",
    },
  ]

  // Hardcoded mock data for suggested users
  const suggestedUsers = [
    {
      name: "カップヌードル",
      username: "cupnoodle_jp",
      avatar: "/default-avatar.png",
      verified: true,
      verifiedColor: "yellow",
    },
    {
      name: "ナガノ",
      username: "ngntrtr",
      avatar: "/default-avatar.png",
      verified: true,
      verifiedColor: "blue",
    },
    {
      name: "M COUNTDOWN",
      username: "MnetMcountdown",
      avatar: "/default-avatar.png",
      verified: true,
      verifiedColor: "blue",
    },
  ]

  return (
    <div className="h-full w-full bg-black overflow-hidden">
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Subscribe to Premium */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <h2 className="text-xl font-bold mb-2">Subscribe to Premium</h2>
          <p className="text-sm text-gray-400 mb-4">
            Subscribe to unlock new features and if eligible, receive a share of revenue.
          </p>
          <button className="w-full py-2 px-4 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors">
            Subscribe
          </button>
        </div>

        {/* What's happening */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold">What's happening</h2>
          </div>
          <div>
            {trends.map((trend, index) => (
              <div
                key={index}
                className="p-4 hover:bg-gray-800 transition-colors cursor-pointer relative group"
              >
                {trend.type === "promoted" ? (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold mb-1">{trend.title}</p>
                        <p className="text-sm text-gray-400 mb-1">{trend.subtitle}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <div className="w-3 h-3 bg-gray-600 rounded-sm"></div>
                          <span>Promoted by {trend.promotedBy}</span>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded-full transition-opacity">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="6" cy="12" r="1.5" />
                          <circle cx="18" cy="12" r="1.5" />
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">{trend.location}</p>
                        <p className="text-sm font-semibold mb-1">{trend.hashtag}</p>
                        <p className="text-xs text-gray-500">{trend.postCount} posts</p>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded-full transition-opacity">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="6" cy="12" r="1.5" />
                          <circle cx="18" cy="12" r="1.5" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-800">
            <a
              href="#"
              className="text-blue-500 hover:underline text-sm"
              onClick={(e) => e.preventDefault()}
            >
              Show more
            </a>
          </div>
        </div>

        {/* Who to follow */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold">Who to follow</h2>
          </div>
          <div>
            {suggestedUsers.map((user, index) => (
              <div
                key={index}
                className="p-4 hover:bg-gray-800 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm truncate">{user.name}</p>
                      {user.verified && (
                        <svg
                          className={`w-4 h-4 ${
                            user.verifiedColor === "yellow"
                              ? "text-yellow-500"
                              : "text-blue-500"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-white text-black rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-800">
            <a
              href="#"
              className="text-blue-500 hover:underline text-sm"
              onClick={(e) => e.preventDefault()}
            >
              Show more
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

