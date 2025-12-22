'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'

export default function LeftSidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  if (!user) {
    return null
  }
  
  if (pathname?.startsWith('/chat/')) {
    return null
  }

  const navItems = [
    { href: '/home', label: 'Home', glyph: 'H' },
    { href: '/search', label: 'Search', glyph: 'S' },
    { href: '/saved', label: 'Saved', glyph: 'V' },
    { href: '/my', label: 'My', glyph: 'M' },
  ]

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-20 bg-[var(--pixel-panel)] border-r-3 border-[var(--pixel-border)] shadow-[6px_0_0_rgba(0,0,0,0.25)] z-40">
      <div className="flex flex-col items-center py-6 space-y-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-3 px-2 transition-all relative ${
                isActive
                  ? 'text-[var(--pixel-highlight)]'
                  : 'text-[var(--pixel-text-dim)] hover:text-[var(--pixel-highlight)]'
              }`}
            >
              <span className="mb-2 flex items-center justify-center w-12 h-12 bg-[var(--pixel-panel)] border-3 border-[var(--pixel-border)] shadow-[4px_4px_0_rgba(0,0,0,0.35)] text-[var(--pixel-text)] text-lg font-bold">
                {item.glyph}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--pixel-text)]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
