'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'
import PixelIcon from './PixelIcon'

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
    { href: '/home', label: 'Home', icon: 'home' as const },
    { href: '/search', label: 'Search', icon: 'search' as const },
    { href: '/saved', label: 'Saved', icon: 'saved' as const },
    { href: '/my', label: 'My', icon: 'my' as const },
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
                className={`mb-2 flex items-center justify-center w-12 h-12 border-3 border-[var(--pixel-border)] transition-all duration-100 ${
                  isActive
                    ? 'bg-[var(--pixel-highlight)] shadow-[4px_4px_0_rgba(0,0,0,0.35)]'
                    : 'bg-[var(--pixel-panel)] shadow-[4px_4px_0_rgba(0,0,0,0.35)] group-hover:shadow-[2px_2px_0_rgba(0,0,0,0.35)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-active:shadow-[1px_1px_0_rgba(0,0,0,0.35)] group-active:translate-x-[2px] group-active:translate-y-[2px]'
                }`}
              >
                <PixelIcon type={item.icon} className={isActive ? 'brightness-0 invert' : ''} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--pixel-text)]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
