"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import Image from "next/image"

interface LogoutConfirmModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LogoutConfirmModal({ isOpen, onClose }: LogoutConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await signOut({ callbackUrl: "/auth/signin" })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
      <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-md p-6">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="/Y.png"
            alt="Y"
            width={40}
            height={40}
            className="object-contain"
            priority
            unoptimized
          />
        </div>

        {/* Question */}
        <h2 className="text-xl font-bold mb-2">Log out of Y?</h2>
        
        {/* Explanatory Text */}
        <p className="text-gray-500 text-sm mb-6">
          You can always log back in at any time. If you just want to switch accounts, you can do that by adding an existing account.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? "Logging out..." : "Log out"}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-transparent border border-gray-700 text-white rounded-full font-semibold hover:bg-gray-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

