"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { calculatePostLength } from "@/lib/utils"

interface PostModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Draft {
  id: string
  content: string
  createdAt: string
  updatedAt: string
}

export function PostModal({ isOpen, onClose }: PostModalProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [showDrafts, setShowDrafts] = useState(false)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loadingDrafts, setLoadingDrafts] = useState(false)
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null)

  const maxLength = 280

  useEffect(() => {
    if (isOpen && showDrafts) {
      fetchDrafts()
    }
  }, [isOpen, showDrafts])

  const fetchDrafts = async () => {
    setLoadingDrafts(true)
    try {
      const response = await fetch("/api/drafts")
      if (response.ok) {
        const data = await response.json()
        setDrafts(data.drafts || [])
      }
    } catch (error) {
      console.error("Failed to fetch drafts:", error)
    } finally {
      setLoadingDrafts(false)
    }
  }

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    // 關鍵修復：在函數內部重新計算，確保使用最新的 content 值
    const currentContent = content
    const currentLength = calculatePostLength(currentContent)
    const hasContent = currentContent.trim().length > 0
    
    if (currentLength > maxLength || !hasContent) {
      console.log("Post validation failed:", { 
        currentLength, 
        maxLength, 
        hasContent,
        content: currentContent 
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentContent }),
      })

      if (response.ok) {
        // If this was editing a draft, delete it
        if (editingDraftId) {
          await fetch(`/api/drafts?id=${editingDraftId}`, { method: "DELETE" })
        }
        setContent("")
        setEditingDraftId(null)
        onClose()
        window.location.reload()
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Failed to create post:", errorData)
        alert(errorData.error || "Failed to create post. Please try again.")
      }
    } catch (error) {
      console.error("Failed to create post:", error)
      alert("An error occurred while creating the post. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [content, editingDraftId, onClose, maxLength])

  const handleClose = useCallback(() => {
    const hasContent = content.trim().length > 0
    if (hasContent) {
      setShowDiscardConfirm(true)
    } else {
      onClose()
    }
  }, [content, onClose])

  const handleSaveDraft = useCallback(async () => {
    const hasContent = content.trim().length > 0
    if (!hasContent) {
      setShowDiscardConfirm(false)
      onClose()
      return
    }

    setLoading(true)
    try {
      if (editingDraftId) {
        // Update existing draft
        await fetch("/api/drafts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingDraftId, content }),
        })
      } else {
        // Create new draft
        await fetch("/api/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        })
      }
      setContent("")
      setEditingDraftId(null)
      setShowDiscardConfirm(false)
      onClose()
    } catch (error) {
      console.error("Failed to save draft:", error)
    } finally {
      setLoading(false)
    }
  }, [content, editingDraftId, onClose])

  const handleDiscard = () => {
    setContent("")
    setEditingDraftId(null)
    setShowDiscardConfirm(false)
    onClose()
  }

  const handleCancelDiscard = () => {
    setShowDiscardConfirm(false)
  }

  const handleLoadDraft = (draft: Draft) => {
    setContent(draft.content)
    setEditingDraftId(draft.id)
    setShowDrafts(false)
  }

  const handleDeleteDraft = async (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`/api/drafts?id=${draftId}`, { method: "DELETE" })
      setDrafts(drafts.filter((d) => d.id !== draftId))
      if (editingDraftId === draftId) {
        setContent("")
        setEditingDraftId(null)
      }
    } catch (error) {
      console.error("Failed to delete draft:", error)
    }
  }

  const handleToggleDrafts = () => {
    setShowDrafts(!showDrafts)
    if (!showDrafts) {
      fetchDrafts()
    }
  }

  if (!isOpen) return null

  // UI 顯示用的計算
  const currentLength = calculatePostLength(content)
  const remainingChars = maxLength - currentLength
  const hasContent = content.trim().length > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" style={{ pointerEvents: 'auto' }}>
      <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col" style={{ pointerEvents: 'auto' }}>
        {showDiscardConfirm ? (
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold">Discard post?</h3>
            <p className="text-gray-500">This post hasn't been sent. You can save it as a draft or discard it.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelDiscard}
                className="px-4 py-2 rounded-full border border-gray-700 hover:bg-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={loading}
                className="px-4 py-2 rounded-full border border-gray-700 hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                Save draft
              </button>
              <button
                onClick={handleDiscard}
                className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        ) : showDrafts ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <button
                onClick={handleToggleDrafts}
                className="p-2 hover:bg-gray-900 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-bold">Drafts</h2>
              <div className="w-9" /> {/* Spacer */}
            </div>

            {/* Drafts List */}
            <div className="flex-1 overflow-y-auto">
              {loadingDrafts ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : drafts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-lg font-bold mb-2">Hold that thought</p>
                  <p className="text-sm">Not ready to post just yet? Save it to your drafts or schedule it for later.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      onClick={() => handleLoadDraft(draft)}
                      className="p-4 hover:bg-gray-900 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-500 flex-1 line-clamp-3">{draft.content}</p>
                        <button
                          onClick={(e) => handleDeleteDraft(draft.id, e)}
                          className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(draft.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-900 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={handleToggleDrafts}
                className="px-4 py-2 text-blue-500 hover:bg-gray-900 rounded-full transition-colors"
              >
                Drafts
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading || currentLength > maxLength || !hasContent}
                className="px-4 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>

            {/* Content */}
            <form id="post-form" onSubmit={handleSubmit} className="p-4">
              <div className="flex gap-4">
                <img
                  src={session?.user?.image || "/default-avatar.png"}
                  alt={session?.user?.name || "User"}
                  className="w-12 h-12 rounded-full object-cover"
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
                    placeholder="What's happening?"
                    className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-lg min-h-[200px]"
                  />
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 cursor-pointer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.53-7-3.06-7-6.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                      <span>Everyone can reply</span>
                    </div>
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
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
