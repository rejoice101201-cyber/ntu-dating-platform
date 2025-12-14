'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import NotificationBadge from './NotificationBadge'

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  if (!user) return null
  
  // Hide navigation on chat pages
  if (pathname?.startsWith('/chat/')) return null

  const navItems = [
    { href: '/discover', label: 'Discover', glyph: 'D' },
    { href: '/matches', label: 'Matches', glyph: 'M', showNotification: true },
    { href: '/profile/me', label: 'Profile', glyph: 'P' },
    { href: '/w', label: 'Wall', glyph: 'W' },
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
              className={`flex flex-col items-center py-2 px-5 transition-all relative ${
                isActive
                  ? 'text-[var(--pixel-highlight)]'
                  : 'text-[var(--pixel-text-dim)] hover:text-[var(--pixel-highlight)]'
              }`}
            >
              <span
                className="mb-2 flex items-center justify-center w-12 h-12 bg-[var(--pixel-panel)] border-3 border-[var(--pixel-border)] shadow-[4px_4px_0_rgba(0,0,0,0.35)] text-[var(--pixel-text)] text-lg font-bold relative"
              >
                {item.glyph}
                {item.showNotification && <NotificationBadge />}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--pixel-text)]">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center py-2 px-5 text-[var(--pixel-text-dim)] hover:text-[var(--pixel-highlight)] transition-all"
        >
          <span className="mb-2 flex items-center justify-center w-12 h-12 bg-[var(--pixel-panel)] border-3 border-[var(--pixel-border)] shadow-[4px_4px_0_rgba(0,0,0,0.35)] text-[var(--pixel-text)] text-lg font-bold">
            L
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--pixel-text)]">Logout</span>
        </button>
      </div>
    </nav>
  )
}

