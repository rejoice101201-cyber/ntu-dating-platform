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
              className={`flex flex-col items-center py-3 px-2 transition-all relative group ${
                isActive
                  ? 'text-[var(--pixel-highlight)]'
                  : 'text-[var(--pixel-text-dim)] hover:text-[var(--pixel-highlight)]'
              }`}
            >
              <span 
                className={`mb-2 flex items-center justify-center w-12 h-12 border-3 border-[var(--pixel-border)] text-lg font-bold transition-all duration-100 ${
                  isActive
                    ? 'bg-[var(--pixel-highlight)] text-white shadow-[4px_4px_0_rgba(0,0,0,0.35)]'
                    : 'bg-[var(--pixel-panel)] text-[var(--pixel-text)] shadow-[4px_4px_0_rgba(0,0,0,0.35)] group-hover:shadow-[2px_2px_0_rgba(0,0,0,0.35)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-active:shadow-[1px_1px_0_rgba(0,0,0,0.35)] group-active:translate-x-[2px] group-active:translate-y-[2px]'
                }`}
                style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
              >
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
