"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "Server configuration error, please contact administrator"
      case "AccessDenied":
        return "Sign in denied, please confirm you have permission to use this service"
      case "Verification":
        return "Verification failed, please try again"
      case "OAuthSignin":
        return "OAuth sign-in initialization failed"
      case "OAuthCallback":
        return "OAuth callback processing failed"
      case "OAuthCreateAccount":
        return "Unable to create OAuth account"
      case "EmailCreateAccount":
        return "Unable to create email account"
      case "Callback":
        return "Callback processing error"
      case "OAuthAccountNotLinked":
        return "This OAuth account is not linked to any user account"
      case "EmailSignin":
        return "Unable to send sign-in email"
      case "CredentialsSignin":
        return "Invalid sign-in credentials"
      case "SessionRequired":
        return "Sign in required to access this page"
      default:
        return error || "An unknown error occurred, please try again"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">Sign-in Error</h1>
          <p className="text-red-500 text-lg mb-6">
            {getErrorMessage(error)}
          </p>
          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="inline-block w-full py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
            >
              Back to sign-in page
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="w-full max-w-md p-8 space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">Sign-in Error</h1>
            <p className="text-gray-500 text-lg mb-6">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}

