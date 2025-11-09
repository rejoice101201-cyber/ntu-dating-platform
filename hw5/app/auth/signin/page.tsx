"use client"

import { signIn, getSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { isValidUserID } from "@/lib/utils"

export default function SignInPage() {
  const router = useRouter()
  const [userID, setUserID] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showUserIDLogin, setShowUserIDLogin] = useState(false)

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
    setLoading(true)
    try {
      console.log(`[SignIn] Attempting to sign in with ${provider}...`)
      
      // Check if user already has session with userID
      const session = await getSession()
      const callbackUrl = session?.user && (session.user as any).userID 
        ? "/"  // If already registered, go to home
        : "/auth/register"  // Otherwise go to register
      
      console.log(`[SignIn] Callback URL: ${callbackUrl}`)
      
      const result = await signIn(provider, {
        callbackUrl,
        redirect: true,
      })
      
      console.log(`[SignIn] signIn result:`, result)
      
      // If signIn returns an error object, it means there was an error
      if (result?.error) {
        console.error(`[SignIn] OAuth error:`, result.error)
        setError(`Sign in failed: ${result.error}`)
        setLoading(false)
        return
      }
      
      // If we get here and redirect is true, NextAuth should handle the redirect
      // But if it doesn't, we'll wait a bit and check
      setTimeout(() => {
        if (!document.hidden) {
          console.warn(`[SignIn] Redirect did not occur, checking for errors...`)
          setLoading(false)
        }
      }, 2000)
      
    } catch (err: any) {
      console.error("[SignIn] OAuth sign-in error:", err)
      // NextAuth.js errors are usually handled by redirecting to error page
      // But we can catch client-side errors here
      if (err?.message) {
        setError(`Sign in failed: ${err.message}`)
      } else {
        setError("Sign in failed, please try again")
      }
      setLoading(false)
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
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Side - Logo */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="max-w-md">
          <Image 
            src="/Y.png" 
            alt="Y" 
            width={400} 
            height={400} 
            className="object-contain"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* Right Side - Login/Signup */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-6xl font-bold mb-12">Happening now</h1>
            <h2 className="text-3xl font-bold mb-8">Join today.</h2>
          </div>

          {/* OAuth Sign-in Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuthSignIn("google")}
              disabled={loading}
              className="w-full py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>
            
            <button
              onClick={() => handleOAuthSignIn("github")}
              disabled={loading}
              className="w-full py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.425 22 12.017 22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
              </svg>
              Sign up with GitHub
            </button>
            
            <button
              onClick={() => handleOAuthSignIn("facebook")}
              disabled={loading}
              className="w-full py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Sign up with Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-500">or</span>
            </div>
          </div>

          {/* Create Account Button */}
          <button
            onClick={() => handleOAuthSignIn("google")}
            className="w-full py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
          >
            Create account
          </button>

          {/* Legal Text */}
          <p className="text-xs text-gray-500">
            By signing up, you agree to the{" "}
            <a href="#" className="text-blue-500 hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
            , including{" "}
            <a href="#" className="text-blue-500 hover:underline">Cookie Use</a>.
          </p>

          {/* Already have an account */}
          <div className="pt-8">
            <h3 className="text-xl font-bold mb-6">Already have an account?</h3>
            
            {/* UserID Login Toggle */}
            <div className="space-y-3">
              <button
                onClick={() => setShowUserIDLogin(!showUserIDLogin)}
                className="w-full py-3 px-4 bg-transparent border border-gray-700 text-white rounded-full font-semibold hover:bg-gray-900 transition-colors"
              >
                {showUserIDLogin ? "Hide" : "Sign in with userID"}
              </button>

              {showUserIDLogin && (
                <form onSubmit={handleLoginWithUserID} className="space-y-3">
                  <input
                    type="text"
                    value={userID}
                    onChange={(e) => setUserID(e.target.value)}
                    placeholder="Enter your userID"
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={15}
                  />
                  <button
                    type="submit"
                    disabled={loading || !userID.trim()}
                    className="w-full py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Checking..." : "Sign in"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
