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
    { href: '/discover', label: 'Discover', icon: '🔍' },
    { href: '/matches', label: 'Matches', icon: '💕' },
    { href: '/profile/me', label: 'Profile', icon: '👤' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--pixel-panel)] border-t-3 border-[var(--pixel-border)] shadow-[0_-6px_0_rgba(0,0,0,0.25)]">
      <div className="max-w-md mx-auto flex justify-around items-center py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-5 transition-all ${
                isActive
                  ? 'text-[var(--pixel-highlight)]'
                  : 'text-[var(--pixel-text-dim)] hover:text-[var(--pixel-highlight)]'
              }`}
            >
              <span className="text-3xl mb-1">{item.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center py-2 px-5 text-[var(--pixel-text-dim)] hover:text-[var(--pixel-highlight)] transition-all"
        >
          <span className="text-3xl mb-1">🚪</span>
          <span className="text-[10px] font-bold uppercase tracking-wide">Logout</span>
        </button>
      </div>
    </nav>
  )
}

