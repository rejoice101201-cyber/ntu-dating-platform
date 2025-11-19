'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  if (!user) return null
  
  // Hide navigation on chat pages
  if (pathname?.startsWith('/chat/')) return null

  const navItems = [
    { href: '/discover', label: '探索', icon: '🔍' },
    { href: '/matches', label: '配對', icon: '💕' },
    { href: '/profile/me', label: '我的', icon: '👤' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-4 ${
                isActive ? 'text-primary-500' : 'text-gray-600'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center py-2 px-4 text-gray-600"
        >
          <span className="text-2xl mb-1">🚪</span>
          <span className="text-xs">登出</span>
        </button>
      </div>
    </nav>
  )
}

