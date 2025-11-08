"use client"

interface NewPostNoticeProps {
  count: number
  authors?: Array<{
    id: string
    name: string | null
    image: string | null
    userID: string | null
  }>
  onShow: () => void
  onDismiss?: () => void
}

export function NewPostNotice({ count, authors = [], onShow, onDismiss }: NewPostNoticeProps) {
  // Get first 3 unique authors
  const uniqueAuthors = Array.from(
    new Map(authors.map((a) => [a.id, a])).values()
  ).slice(0, 3)

  return (
    <div className="sticky top-0 z-50 bg-black border-b border-gray-800">
      <div className="flex items-center justify-between p-4 bg-blue-500/10 border-b border-blue-500/20">
        <div className="flex items-center gap-3">
          {/* Avatars */}
          {uniqueAuthors.length > 0 && (
            <div className="flex -space-x-2">
              {uniqueAuthors.map((author, index) => (
                <img
                  key={author.id}
                  src={author.image || "/default-avatar.png"}
                  alt={author.name || "User"}
                  className="w-6 h-6 rounded-full border-2 border-black object-cover"
                  style={{ zIndex: uniqueAuthors.length - index }}
                />
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-blue-500">
              {uniqueAuthors.length > 0 ? (
                <>
                  {uniqueAuthors.length === 1 && (
                    <>{uniqueAuthors[0].name || `@${uniqueAuthors[0].userID || "unknown"}`} posted</>
                  )}
                  {uniqueAuthors.length === 2 && (
                    <>
                      {uniqueAuthors[0].name || `@${uniqueAuthors[0].userID || "unknown"}`} and{" "}
                      {uniqueAuthors[1].name || `@${uniqueAuthors[1].userID || "unknown"}`} posted
                    </>
                  )}
                  {uniqueAuthors.length >= 3 && (
                    <>
                      {uniqueAuthors[0].name || `@${uniqueAuthors[0].userID || "unknown"}`},{" "}
                      {uniqueAuthors[1].name || `@${uniqueAuthors[1].userID || "unknown"}`}, and{" "}
                      {uniqueAuthors[2].name || `@${uniqueAuthors[2].userID || "unknown"}`}
                      {count > 3 && ` and ${count - 3} more`} posted
                    </>
                  )}
                </>
              ) : (
                <>
                  {count} {count === 1 ? "new post" : "new posts"}
                </>
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onShow}
            className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            Show
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 hover:bg-blue-500/20 rounded-full transition-colors"
            >
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

