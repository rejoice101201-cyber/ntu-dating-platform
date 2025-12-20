'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import NotificationBadge from './NotificationBadge'
import { useUnreadMessages } from './hooks/useUnreadMessages'
import { motion } from 'framer-motion'

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { totalUnread } = useUnreadMessages()

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
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-[var(--pixel-panel)] border-t-3 border-[var(--pixel-border)] shadow-[0_-6px_0_rgba(0,0,0,0.25)] z-50"
    >
      <div className="max-w-md mx-auto flex justify-around items-center py-3">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href)
          const showUnreadBadge = item.href === '/matches' && totalUnread > 0
          
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={item.href}
                className={`flex flex-col items-center py-2 px-5 transition-all duration-200 ease-smooth relative ${
                  isActive
                    ? 'text-[var(--pixel-highlight)]'
                    : 'text-[var(--pixel-text-dim)] hover:text-[var(--pixel-highlight)]'
                }`}
              >
                <motion.span
                  className="mb-2 flex items-center justify-center w-12 h-12 bg-[var(--pixel-panel)] border-3 border-[var(--pixel-border)] shadow-[4px_4px_0_rgba(0,0,0,0.35)] text-[var(--pixel-text)] text-lg font-bold relative"
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: '6px 6px 0 rgba(0,0,0,0.35)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {item.glyph}
                  {item.showNotification && <NotificationBadge />}
                  {/* 显示未读消息总数 */}
                  {showUnreadBadge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold border-2 border-white rounded-full flex items-center justify-center shadow-[2px_2px_0_rgba(0,0,0,0.25)] z-10"
                    >
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </motion.span>
                  )}
                </motion.span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--pixel-text)]">
                  {item.label}
                </span>
              </Link>
            </motion.div>
          )
        })}
        <motion.button
          onClick={logout}
          className="flex flex-col items-center py-2 px-5 text-[var(--pixel-text-dim)] hover:text-[var(--pixel-highlight)] transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className="mb-2 flex items-center justify-center w-12 h-12 bg-[var(--pixel-panel)] border-3 border-[var(--pixel-border)] shadow-[4px_4px_0_rgba(0,0,0,0.35)] text-[var(--pixel-text)] text-lg font-bold"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            L
          </motion.span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--pixel-text)]">Logout</span>
        </motion.button>
      </div>
    </motion.nav>
  )
}

