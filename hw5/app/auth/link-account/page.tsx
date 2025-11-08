"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

function LinkAccountContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const email = searchParams.get("email") || ""
  const provider = searchParams.get("provider") || ""
  const existingProvider = searchParams.get("existingProvider") || ""

  useEffect(() => {
    if (!email || !provider || !existingProvider) {
      router.push("/auth/signin?error=OAuthAccountNotLinked")
    }
  }, [email, provider, existingProvider, router])

  const handleLinkAccount = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/link-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          provider,
          existingProvider,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to link account")
        setLoading(false)
        return
      }

      // Sign in with the new provider - the signIn callback will handle linking
      // since it will detect same email and create the account link
      await signIn(provider, {
        callbackUrl: "/",
        redirect: true,
      })
    } catch (err) {
      setError("An error occurred, please try again")
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/auth/signin?error=OAuthAccountNotLinked")
  }

  if (!email || !provider || !existingProvider) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Link Account</h1>
          <p className="text-gray-400">
            You already have a {existingProvider} account
          </p>
          <p className="text-gray-400 mt-1">{email}</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
          <p className="text-sm text-gray-300">
            Do you want to link your {provider} account to your existing account?
          </p>
          <p className="text-xs text-gray-500">
            After linking, you can sign in with either method using the same account
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleLinkAccount}
            disabled={loading}
            className="w-full py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Link account"}
          </button>

          <button
            onClick={handleCancel}
            disabled={loading}
            className="w-full py-3 px-4 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LinkAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="w-full max-w-md p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Link Account</h1>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LinkAccountContent />
    </Suspense>
  )
}

