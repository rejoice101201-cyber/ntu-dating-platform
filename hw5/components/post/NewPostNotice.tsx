"use client"

interface NewPostNoticeProps {
  count: number
  onShow: () => void
  onDismiss?: () => void
}

export function NewPostNotice({ count, onShow, onDismiss }: NewPostNoticeProps) {
  return (
    <div className="sticky top-0 z-50 bg-black border-b border-gray-800">
      <div className="flex items-center justify-between p-4 bg-blue-500/10 border-b border-blue-500/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-blue-500">
            {count} {count === 1 ? "new post" : "new posts"}
          </span>
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

