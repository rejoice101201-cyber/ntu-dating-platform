'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'

export default function LeftSidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  if (!user) return null
  
  // Hide sidebar on chat pages
  if (pathname?.startsWith('/chat/')) return null

  const navItems = [
    { href: '/home', label: 'Home', glyph: 'H' },
    { href: '/search', label: 'Search', glyph: 'S' },
    { href: '/saved', label: 'Saved', glyph: 'V' },
    { href: '/my', label: 'My', glyph: 'M' },
  ]

  return (
    <motion.nav 
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 bottom-0 w-20 bg-[var(--pixel-panel)] border-r-3 border-[var(--pixel-border)] shadow-[6px_0_0_rgba(0,0,0,0.25)] z-40"
    >
      <div className="flex flex-col items-center py-6 space-y-4">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href)
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={item.href}
                className={`flex flex-col items-center py-3 px-2 transition-all duration-200 ease-smooth relative ${
                  isActive
                    ? 'text-[var(--pixel-highlight)]'
                    : 'text-[var(--pixel-text-dim)] hover:text-[var(--pixel-highlight)]'
                }`}
              >
                <motion.span
                  className="mb-2 flex items-center justify-center w-12 h-12 bg-[var(--pixel-panel)] border-3 border-[var(--pixel-border)] shadow-[4px_4px_0_rgba(0,0,0,0.35)] text-[var(--pixel-text)] text-lg font-bold"
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: '6px 6px 0 rgba(0,0,0,0.35)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {item.glyph}
                </motion.span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--pixel-text)]">{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </motion.nav>
  )
}
