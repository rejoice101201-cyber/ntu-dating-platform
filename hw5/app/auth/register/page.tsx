"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { isValidUserID } from "@/lib/utils"

export default function RegisterPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [userID, setUserID] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }
    
    // If user already has userID, redirect to home
    if (session?.user) {
      const user = session.user as any
      if (user.userID) {
        router.push("/")
      }
    }

    // Add beforeunload event listener to warn user when leaving
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!userID.trim()) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    // Handle browser back button
    const handlePopState = (e: PopStateEvent) => {
      if (!userID.trim()) {
        e.preventDefault()
        setShowLeaveConfirm(true)
        // Push state back to prevent navigation
        window.history.pushState(null, "", window.location.href)
      }
    }

    window.history.pushState(null, "", window.location.href)
    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [status, session, router, userID])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!userID.trim()) {
      setError("Please enter userID")
      return
    }

    if (!isValidUserID(userID)) {
      setError("Invalid userID format: only letters, numbers, and underscores allowed, 1-15 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: userID.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      // Registration successful, redirect to home
      router.push("/")
    } catch (err) {
      setError("An error occurred, please try again")
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false)
    router.push("/auth/signin")
  }

  const handleCancelLeave = () => {
    setShowLeaveConfirm(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Set your userID</h1>
          <p className="text-gray-400">Choose a unique userID (1-15 characters, letters, numbers, and underscores only)</p>
        </div>

        {/* Status message */}
        {session?.user && (
          <div className="bg-gray-900 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-300">
              You are signed in. Please complete your userID setup to get started.
            </p>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-gray-400 underline"
            >
              Sign out
            </button>
          </div>
        )}

        {/* Leave confirmation dialog */}
        {showLeaveConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-6 space-y-4 max-w-md mx-4">
              <h2 className="text-xl font-bold">Are you sure you want to leave?</h2>
              <p className="text-gray-400 text-sm">
                Your sign-in status will be saved. You can continue registration later.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmLeave}
                  className="flex-1 py-2 px-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
                >
                  Leave
                </button>
                <button
                  onClick={handleCancelLeave}
                  className="flex-1 py-2 px-4 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="userID" className="block text-sm font-medium mb-2">
              userID
            </label>
            <input
              id="userID"
              type="text"
              value={userID}
              onChange={(e) => {
                setUserID(e.target.value)
                setError("")
              }}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. john_doe123"
              maxLength={15}
            />
            <p className="mt-1 text-xs text-gray-500">
              {userID.length}/15 characters
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !userID.trim()}
            className="w-full py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Complete registration"}
          </button>
        </form>
      </div>
    </div>
  )
}

