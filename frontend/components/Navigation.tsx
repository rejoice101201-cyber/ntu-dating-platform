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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-pink-200 shadow-2xl">
      <div className="max-w-md mx-auto flex justify-around items-center py-3 bg-gradient-to-t from-pink-50 to-white">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-6 rounded-2xl transition-all transform hover:scale-110 ${
                isActive 
                  ? 'text-pink-600 bg-pink-100 shadow-lg' 
                  : 'text-gray-500 hover:text-pink-400'
              }`}
            >
              <span className="text-3xl mb-1">{item.icon}</span>
              <span className="text-xs font-bold">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center py-2 px-6 rounded-2xl text-gray-500 hover:text-pink-400 transition-all transform hover:scale-110"
        >
          <span className="text-3xl mb-1">🚪</span>
          <span className="text-xs font-bold">登出</span>
        </button>
      </div>
    </nav>
  )
}

