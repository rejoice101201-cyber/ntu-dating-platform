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
    { href: '/discover', label: 'Discover', glyph: 'D' },
    { href: '/matches', label: 'Matches', glyph: 'M' },
    { href: '/profile/me', label: 'Profile', glyph: 'P' },
    { href: '/w', label: 'Wall', glyph: 'W' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--pixel-panel)] border-t-3 border-[var(--pixel-border)] shadow-[0_-6px_0_rgba(0,0,0,0.25)]">
      <div className="max-w-md mx-auto flex justify-around items-center py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/w' && pathname === '/w') || (item.href === '/home' && pathname === '/home')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-5 transition-all group ${
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
              <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--pixel-text)]">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center py-2 px-5 text-[var(--pixel-text-dim)] hover:text-[var(--pixel-highlight)] transition-all group"
        >
          <span 
            className="mb-2 flex items-center justify-center w-12 h-12 bg-[var(--pixel-panel)] border-3 border-[var(--pixel-border)] text-lg font-bold shadow-[4px_4px_0_rgba(0,0,0,0.35)] text-[var(--pixel-text)] transition-all duration-100 group-hover:shadow-[2px_2px_0_rgba(0,0,0,0.35)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-active:shadow-[1px_1px_0_rgba(0,0,0,0.35)] group-active:translate-x-[2px] group-active:translate-y-[2px]"
            style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
          >
            L
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--pixel-text)]">Logout</span>
        </button>
      </div>
    </nav>
  )
}

