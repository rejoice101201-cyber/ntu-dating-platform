'use client'

import { Heart, ThumbsUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface PostActionButtonProps {
  type: 'favorite' | 'like'
  isActive?: boolean
  count?: number
  onClick: () => void
  ariaLabel?: string
}

export default function PostActionButton({ 
  type, 
  isActive, 
  count, 
  onClick,
  ariaLabel 
}: PostActionButtonProps) {
  const Icon = type === 'favorite' ? Heart : ThumbsUp
  const active = !!isActive
  
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
        relative flex items-center gap-1 px-2 py-1.5 rounded-none
        border-3 border-[var(--pixel-border)]
        transition-all duration-200
        ${active
          ? type === 'favorite'
            ? 'bg-pink-100 text-pink-600 shadow-[3px_3px_0_rgba(0,0,0,0.25)]' 
            : 'bg-blue-100 text-blue-600 shadow-[3px_3px_0_rgba(0,0,0,0.25)]'
          : 'bg-[var(--pixel-panel)] text-[var(--pixel-text-dim)] shadow-[2px_2px_0_rgba(0,0,0,0.15)]'
        }
        hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)]
        active:shadow-[1px_1px_0_rgba(0,0,0,0.25)]
        active:translate-x-[1px] active:translate-y-[1px]
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon 
        size={18} 
        className={active ? 'fill-current' : ''}
      />
      {count !== undefined && count > 0 && (
        <span className="text-xs font-bold">{count}</span>
      )}
    </motion.button>
  )
}

