"use client"

import { signIn, getSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isValidUserID } from "@/lib/utils"

export default function SignInPage() {
  const router = useRouter()
  const [userID, setUserID] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if already logged in with valid session
    getSession().then((session) => {
      if (session?.user) {
        // If user has userID, redirect to home
        // Otherwise redirect to register page
        const user = session.user as any
        if (user.userID) {
          router.push("/")
        } else {
          router.push("/auth/register")
        }
      }
    })
  }, [router])

  const handleOAuthSignIn = async (provider: string) => {
    setError("")
    try {
      // Check if user already has session with userID
      const session = await getSession()
      const callbackUrl = session?.user && (session.user as any).userID 
        ? "/"  // If already registered, go to home
        : "/auth/register"  // Otherwise go to register
      
      await signIn(provider, {
        callbackUrl,
        redirect: true,
      })
    } catch (err: any) {
      console.error("OAuth sign-in error:", err)
      // NextAuth.js errors are usually handled by redirecting to error page
      // But we can catch client-side errors here
      if (err?.message) {
        setError(`Sign in failed: ${err.message}`)
      } else {
        setError("Sign in failed, please try again")
      }
    }
  }

  const handleLoginWithUserID = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmed = userID.trim()
    if (!trimmed) {
      setError("Please enter userID")
      return
    }
    if (!isValidUserID(trimmed)) {
      setError("Invalid userID format: only letters, numbers, and underscores allowed, 1-15 characters")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/auth/provider?userID=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      if (!res.ok) {
        // Provide clearer error messages
        if (res.status === 404) {
          setError(`UserID "${trimmed}" does not exist, please check your input`)
        } else if (res.status === 400) {
          setError(data?.error || "This userID has not been set up with a login method, please register again")
        } else {
          setError(data?.error || "Failed to query login method, please try again later")
        }
        setLoading(false)
        return
      }
      const provider = data.provider as string
      // 依助教規格：用 userID 先查 provider，再喚起該 provider 的 OAuth 登入
      // 如果 OAuth 認證失敗（錯誤的帳密），NextAuth 會自動處理並重定向到錯誤頁面
      await signIn(provider, { 
        callbackUrl: "/",
        redirect: true,
      })
    } catch (err: any) {
      console.error("UserID login error:", err)
      if (err?.message?.includes("fetch")) {
        setError("Unable to connect to server, please check your network connection")
      } else {
        setError("An error occurred, please try again")
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome</h1>
          <p className="text-gray-400">Enter your userID to sign in, or use quick registration below</p>
        </div>

        {/* Login via userID (query provider → OAuth) */}
        <form onSubmit={handleLoginWithUserID} className="space-y-3">
          <input
            type="text"
            value={userID}
            onChange={(e) => setUserID(e.target.value)}
            placeholder="Enter your userID, e.g. steven123"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={15}
          />
          <button
            type="submit"
            disabled={loading || !userID.trim()}
            className="w-full py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Checking..." : "Sign in with userID"}
          </button>
        </form>

        <div className="space-y-4">
          <button
            onClick={() => handleOAuthSignIn("google")}
            className="w-full py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
          >
            Sign up / Sign in with Google
          </button>
          
          <button
            onClick={() => handleOAuthSignIn("github")}
            className="w-full py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
          >
            Sign up / Sign in with GitHub
          </button>
          
          <button
            onClick={() => handleOAuthSignIn("facebook")}
            className="w-full py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
          >
            Sign up / Sign in with Facebook
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
      </div>
    </div>
  )
}

