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
    <div className="h-full w-full bg-black flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 flex items-center justify-center">
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
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "#" && false)
          
          if (item.highlight) {
            return (
              <button
                key={item.label}
                onClick={handlePostClick}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors mt-4"
              >
                <span>{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-900 transition-colors relative ${
                isActive ? "font-semibold" : ""
              }`}
            >
              <div className="relative">
                {item.icon}
                {isActive && item.href === "/" && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
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
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 text-left min-w-0">
            <div className="font-semibold truncate">{session.user.name}</div>
            <div className="text-sm text-gray-500 truncate">
              @{(session.user as any).userID || "unknown"}
            </div>
          </div>
          <svg
            className="w-5 h-5 text-gray-400 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="6" cy="12" r="1.5" />
            <circle cx="18" cy="12" r="1.5" />
          </svg>
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
      <path d="M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM12 16.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.318.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm-1.344-7.8C4.489 9.69 6.266 8 8.5 8c2.234 0 4.011 1.69 4.193 4.2.014.11.014.22 0 .33C12.511 15.31 10.734 17 8.5 17c-2.234 0-4.011-1.69-4.193-4.2-.014-.11-.014-.22 0-.33zM12 5c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM8.5 8C6.266 8 4.489 9.69 4.307 12.2c-.014.11-.014.22 0 .33C4.489 15.31 6.266 17 8.5 17c2.234 0 4.011-1.69 4.193-4.2.014-.11.014-.22 0-.33C12.511 9.69 10.734 8 8.5 8z" />
    </svg>
  )
}

function PostIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23 3c-6.62-.1-15.99 2.28-18.5 3.03C2.5 6.5 2 7.75 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.25-.5-2.5-1.5-3.47C23 3.5 23 3.25 23 3zM12 7.5c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm-6.5 11c-.83 0-1.5-.67-1.5-1.5v-7c0-.83.67-1.5 1.5-1.5S7 9.17 7 10v7c0 .83-.67 1.5-1.5 1.5zm13 0c-.83 0-1.5-.67-1.5-1.5v-7c0-.83.67-1.5 1.5-1.5S20 9.17 20 10v7c0 .83-.67 1.5-1.5 1.5z" />
    </svg>
  )
}

