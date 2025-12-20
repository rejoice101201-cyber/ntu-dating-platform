'use client'

import { motion } from 'framer-motion'
import { Heart, ThumbsUp, MessageCircle } from 'lucide-react'

interface IconButtonProps {
  icon: 'heart' | 'thumbsUp' | 'message'
  count?: number
  active?: boolean
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'primary' | 'secondary'
  size?: 'sm' | 'md'
  'aria-label'?: string
}

export default function IconButton({
  icon,
  count,
  active = false,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'md',
  'aria-label': ariaLabel,
}: IconButtonProps) {
  const iconMap = {
    heart: Heart,
    thumbsUp: ThumbsUp,
    message: MessageCircle,
  }

  const Icon = iconMap[icon]

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
  }

  const iconSizes = {
    sm: 16,
    md: 20,
  }

  const variantClasses = {
    default: active
      ? 'bg-red-50 border-red-300 text-red-500 shadow-red-200'
      : 'bg-[var(--pixel-panel)] border-[var(--pixel-border)] text-[var(--pixel-text-dim)] hover:bg-[var(--pixel-surface)] hover:border-[var(--pixel-text-dim)]',
    primary: active
      ? 'bg-[var(--pixel-highlight)]/10 border-[var(--pixel-highlight)] text-[var(--pixel-highlight)] shadow-[var(--pixel-highlight)]/20'
      : 'bg-[var(--pixel-panel)] border-[var(--pixel-border)] text-[var(--pixel-text-dim)] hover:bg-[var(--pixel-surface)] hover:border-[var(--pixel-highlight)]/50',
    secondary: 'bg-[var(--pixel-highlight)] border-[var(--pixel-highlight)] text-white hover:bg-[#0284c7] hover:border-[#0284c7]',
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        border-3 rounded-lg
        shadow-[3px_3px_0_rgba(0,0,0,0.15)]
        flex items-center justify-center
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        relative overflow-hidden
        group
      `}
      whileHover={!disabled ? {
        scale: 1.08,
        boxShadow: '4px 4px 0 rgba(0,0,0,0.2)',
        y: -1,
        x: -1,
      } : {}}
      whileTap={!disabled ? {
        scale: 0.92,
        boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
        y: 0,
        x: 0,
      } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* 光效背景 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.2 }}
      />
      
      {/* 图标 */}
      <motion.div
        className="relative z-10"
        animate={active ? {
          scale: [1, 1.3, 1],
        } : {}}
        transition={{ 
          duration: 0.4,
          ease: 'easeOut'
        }}
      >
        <Icon 
          size={iconSizes[size]} 
          fill={active && (icon === 'heart' || icon === 'thumbsUp') ? 'currentColor' : 'none'}
          strokeWidth={active ? 2.5 : 2}
        />
      </motion.div>

      {/* 数字徽章 */}
      {count !== undefined && count > 0 && (
        <motion.span
          className={`
            absolute -top-1.5 -right-1.5
            min-w-[20px] h-[20px]
            px-1.5
            text-[11px] font-bold
            rounded-full
            flex items-center justify-center
            ${active 
              ? 'bg-[var(--pixel-highlight)] text-white shadow-lg' 
              : 'bg-[var(--pixel-text-dim)] text-white'
            }
            border-2 border-white
            shadow-[2px_2px_0_rgba(0,0,0,0.2)]
          `}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 500, 
            damping: 15,
            delay: 0.1
          }}
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </motion.button>
  )
}

