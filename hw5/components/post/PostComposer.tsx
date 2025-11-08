"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { calculatePostLength } from "@/lib/utils"

interface PostComposerProps {
  parentId?: string
}

export function PostComposer({ parentId }: PostComposerProps = {}) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const maxLength = 280
  const currentLength = calculatePostLength(content)
  const remainingChars = maxLength - currentLength

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentLength > maxLength || !content.trim()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      })

      if (response.ok) {
        setContent("")
        setIsExpanded(false)
        // TODO: Refresh feed
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to create post:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user) return null

  return (
    <form onSubmit={handleSubmit} className="border-b border-gray-800">
      <div className="flex gap-4 p-4">
        <img
          src={session.user.image || "/default-avatar.png"}
          alt={session.user.name || "User"}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => {
              const newContent = e.target.value
              if (calculatePostLength(newContent) <= maxLength) {
                setContent(newContent)
              }
            }}
            onFocus={() => setIsExpanded(true)}
            placeholder="What's happening?"
            className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-xl min-h-[60px]"
            rows={isExpanded ? 4 : 2}
          />
          
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
            <div className="flex items-center gap-4">
              {/* Media Icons - Decoration Only */}
              <button
                type="button"
                className="text-blue-500 hover:bg-blue-500/10 rounded-full p-2 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM4.25 3.5h15.5c.413 0 .75.337.75.75v9.676l-3.858-3.858c-.14-.14-.33-.22-.53-.22h-.003c-.2 0-.393.08-.532.224l-4.317 5.758-2.813-2.806c-.14-.14-.33-.22-.53-.22-.193-.03-.395.08-.535.227L3.5 17.642V4.25c0-.413.337-.75.75-.75zm-.744 16.28l5.418-5.534 6.282 6.254H4.25c-.402 0-.727-.322-.744-.72zm16.494 0h-2.42l-5.007-4.987 3.792-3.85 4.385 5.412v3.373c0 .412-.337.75-.75.75z" />
                </svg>
              </button>
              <button
                type="button"
                className="text-blue-500 hover:bg-blue-500/10 rounded-full p-2 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </button>
              <button
                type="button"
                className="text-blue-500 hover:bg-blue-500/10 rounded-full p-2 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H19V1h-2v1H7V1H5v1H3.5C2.67 2 2 2.67 2 3.5v17C2 21.33 2.67 22 3.5 22h17c.83 0 1.5-.67 1.5-1.5v-17C22 2.67 21.33 2 20.5 2zM20 20H4V9h16v11z" />
                </svg>
              </button>
              <button
                type="button"
                className="text-blue-500 hover:bg-blue-500/10 rounded-full p-2 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </button>
              <button
                type="button"
                className="text-blue-500 hover:bg-blue-500/10 rounded-full p-2 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </button>
              
              {/* Everyone can reply */}
              <div className="flex items-center gap-1 text-blue-500 text-sm hover:bg-blue-500/10 rounded-full px-3 py-1 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.53-7-3.06-7-6.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
                <span>Everyone can reply</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isExpanded && (
                <>
                  <div className="text-sm text-gray-500">
                    {remainingChars >= 0 ? (
                      <span className={remainingChars < 20 ? "text-yellow-500" : ""}>
                        {remainingChars}
                      </span>
                    ) : (
                      <span className="text-red-500">
                        {Math.abs(remainingChars)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setContent("")
                      setIsExpanded(false)
                    }}
                    className="px-4 py-2 rounded-full border border-gray-700 hover:bg-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                type="submit"
                disabled={loading || currentLength > maxLength || !content.trim()}
                className="px-4 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

