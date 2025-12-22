'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import PixelIcon from './PixelIcon'

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  if (!user) return null
  
  // Hide navigation on chat pages
  if (pathname?.startsWith('/chat/')) return null

  const navItems = [
    { href: '/discover', label: 'Discover', icon: 'discover' as const },
    { href: '/matches', label: 'Matches', icon: 'matches' as const },
    { href: '/profile/me', label: 'Profile', icon: 'profile' as const },
    { href: '/w', label: 'Wall', icon: 'wall' as const },
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
                className={`mb-2 flex items-center justify-center w-12 h-12 border-3 border-[var(--pixel-border)] transition-all duration-100 ${
                  isActive
                    ? 'bg-[var(--pixel-highlight)] shadow-[4px_4px_0_rgba(0,0,0,0.35)]'
                    : 'bg-[var(--pixel-panel)] shadow-[4px_4px_0_rgba(0,0,0,0.35)] group-hover:shadow-[2px_2px_0_rgba(0,0,0,0.35)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-active:shadow-[1px_1px_0_rgba(0,0,0,0.35)] group-active:translate-x-[2px] group-active:translate-y-[2px]'
                }`}
              >
                <PixelIcon type={item.icon} className={isActive ? 'brightness-0 invert' : ''} />
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
            className="mb-2 flex items-center justify-center w-12 h-12 bg-[var(--pixel-panel)] border-3 border-[var(--pixel-border)] shadow-[4px_4px_0_rgba(0,0,0,0.35)] transition-all duration-100 group-hover:shadow-[2px_2px_0_rgba(0,0,0,0.35)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-active:shadow-[1px_1px_0_rgba(0,0,0,0.35)] group-active:translate-x-[2px] group-active:translate-y-[2px]"
          >
            <PixelIcon type="logout" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--pixel-text)]">Logout</span>
        </button>
      </div>
    </nav>
  )
}

