"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
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
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    if (!session?.user) return

    const fetchNotificationCount = async () => {
      try {
        const response = await fetch("/api/notifications/count")
        if (response.ok) {
          const data = await response.json()
          setNotificationCount(data.count || 0)
        }
      } catch (error) {
        console.error("Failed to fetch notification count:", error)
      }
    }

    fetchNotificationCount()
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotificationCount, 30000)

    return () => clearInterval(interval)
  }, [session?.user])

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
      icon: <ExploreIcon />,
      label: "Explore",
      href: "#",
    },
    {
      icon: <NotificationIcon count={notificationCount} />,
      label: "Notifications",
      href: "/notifications",
    },
    {
      icon: <MessagesIcon />,
      label: "Messages",
      href: "#",
    },
    {
      icon: <GrokIcon />,
      label: "Grok",
      href: "#",
    },
    {
      icon: <ListsIcon />,
      label: "Lists",
      href: "#",
    },
    {
      icon: <BookmarksIcon />,
      label: "Bookmarks",
      href: "#",
    },
    {
      icon: <CommunitiesIcon />,
      label: "Communities",
      href: "#",
    },
    {
      icon: <PremiumIcon />,
      label: "Premium",
      href: "#",
    },
    {
      icon: <ProfileIcon />,
      label: "Profile",
      // Use userID if available, otherwise use id (UUID)
      // The profile page now supports both
      href: `/profile/${(session.user as any).userID || session.user.id}`,
    },
    {
      icon: <MoreIcon />,
      label: "More",
      href: "#",
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
          
          // Handle non-functional items (href === "#")
          if (item.href === "#") {
            return (
              <button
                key={item.label}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-900 transition-colors cursor-not-allowed opacity-50"
                disabled
              >
                <div className="relative">
                  {item.icon}
                </div>
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
        
        {/* Post Button */}
        <button
          onClick={handlePostClick}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors mt-4"
        >
          <span>Post</span>
        </button>
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

function ExploreIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5-3.806 8.5-8.5 8.5-8.5-3.806-8.5-8.5zM15.72 2.655c.414 0 .75.336.75.75v2.25h2.25c.414 0 .75.336.75.75s-.336.75-.75.75H16.47v2.25c0 .414-.336.75-.75.75s-.75-.336-.75-.75V7.155h-2.25c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h2.25V3.405c0-.414.336-.75.75-.75zm6 5.25c.414 0 .75.336.75.75v11.186l-4.28-4.28c-.292-.292-.768-.292-1.06 0l-4.28 4.28V8.655c0-.414.336-.75.75-.75s.75.336.75.75v8.68l3.22-3.22c.292-.292.768-.292 1.06 0l3.22 3.22V8.655c0-.414.336-.75.75-.75z" />
    </svg>
  )
}

function NotificationIcon({ count = 0 }: { count?: number }) {
  return (
    <div className="relative">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      {count > 0 && (
        <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center px-1">
          <span className="text-white text-xs font-bold">
            {count > 99 ? "99+" : count}
          </span>
        </div>
      )}
    </div>
  )
}

function MessagesIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  )
}

function GrokIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  )
}

function ListsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function BookmarksIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  )
}

function CommunitiesIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.059 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  )
}

function PremiumIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3.75 12c0-4.56 3.69-8.25 8.25-8.25s8.25 3.69 8.25 8.25-3.69 8.25-8.25 8.25S3.75 16.56 3.75 12zM12 1.75C6.34 1.75 1.75 6.34 1.75 12S6.34 22.25 12 22.25 22.25 17.66 22.25 12 17.66 1.75 12 1.75zm-4.75 11.5c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25S6 11.31 6 12s.56 1.25 1.25 1.25zm9.5 0c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25-1.25.56-1.25 1.25.56 1.25 1.25 1.25zM13.25 12c0 .69-.56 1.25-1.25 1.25s-1.25-.56-1.25-1.25.56-1.25 1.25-1.25 1.25.56 1.25 1.25z" />
    </svg>
  )
}

