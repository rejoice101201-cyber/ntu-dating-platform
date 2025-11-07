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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <img
          src={session.user.image || "/default-avatar.png"}
          alt={session.user.name || "User"}
          className="w-12 h-12 rounded-full"
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
            className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-lg"
            rows={isExpanded ? 4 : 1}
          />
          
          {isExpanded && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                {remainingChars >= 0 ? (
                  <span className={remainingChars < 20 ? "text-yellow-500" : ""}>
                    {remainingChars} characters remaining
                  </span>
                ) : (
                  <span className="text-red-500">
                    {Math.abs(remainingChars)} characters over limit
                  </span>
                )}
              </div>
              <div className="flex gap-2">
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
                <button
                  type="submit"
                  disabled={loading || currentLength > maxLength || !content.trim()}
                  className="px-4 py-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}

