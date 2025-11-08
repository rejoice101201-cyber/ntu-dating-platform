"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { PostModal } from "@/components/post/PostModal"

interface SidebarItem {
  icon: React.ReactNode
  label: string
  href: string
  highlight?: boolean
}

export function Sidebar() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [showLogout, setShowLogout] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)

  if (!session?.user) {
    return null
  }

  const menuItems: SidebarItem[] = [
    {
      icon: <HomeIcon />,
      label: "Home",
      href: "/",
    },
    {
      icon: <ProfileIcon />,
      label: "Profile",
      // Use userID if available, otherwise use id (UUID)
      // The profile page now supports both
      href: `/profile/${(session.user as any).userID || session.user.id}`,
    },
    {
      icon: <PostIcon />,
      label: "Post",
      href: "#",
      highlight: true,
    },
  ]

  const handlePostClick = () => {
    setShowPostModal(true)
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 border-r border-gray-800 bg-black flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800 flex items-center">
        <Image 
          src="/Y.png" 
          alt="Y" 
          width={32} 
          height={32} 
          className="object-contain"
          priority
          unoptimized
        />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "#" && false)
          
          if (item.highlight) {
            return (
              <button
                key={item.label}
                onClick={handlePostClick}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-900 transition-colors ${
                isActive ? "font-semibold" : ""
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800 relative">
        <button
          onClick={() => setShowLogout(!showLogout)}
          className="w-full flex items-center gap-3 p-3 rounded-full hover:bg-gray-900 transition-colors"
        >
          <img
            src={session.user.image || "/default-avatar.png"}
            alt={session.user.name || "User"}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 text-left">
            <div className="font-semibold">{session.user.name}</div>
            <div className="text-sm text-gray-500">
              @{(session.user as any).userID || "unknown"}
            </div>
          </div>
        </button>

        {showLogout && (
          <div className="absolute bottom-20 left-4 right-4 bg-gray-900 rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      <PostModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} />
    </div>
  )
}

function HomeIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function PostIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

