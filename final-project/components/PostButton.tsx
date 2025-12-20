'use client'

import { motion } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import { ReactNode } from 'react'

interface PostButtonProps {
  posting: boolean
  disabled: boolean
  children?: ReactNode
}

export default function PostButton({ posting, disabled, children }: PostButtonProps) {
  return (
    <motion.button
      type="submit"
      disabled={disabled}
      className={`
        relative px-8 py-3 
        bg-gradient-to-r from-[var(--pixel-highlight)] via-[#0ea5e9] to-[var(--pixel-highlight)]
        text-white font-bold text-base
        border-3 border-[var(--pixel-border)]
        shadow-[4px_4px_0_rgba(0,0,0,0.25)]
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden
        group
      `}
      whileHover={!disabled ? {
        scale: 1.02,
        boxShadow: '6px 6px 0 rgba(0,0,0,0.3)',
        y: -2,
        x: -2,
      } : {}}
      whileTap={!disabled ? {
        scale: 0.98,
        boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
        y: 0,
        x: 0,
      } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* 光效背景动画 */}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={!disabled ? {
          x: ['-100%', '200%'],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
          ease: 'linear',
        }}
      />
      
      {/* 按钮内容 */}
      <span className="relative flex items-center gap-2">
        {posting ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>發佈中...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>{children || '發佈'}</span>
          </>
        )}
      </span>
    </motion.button>
  )
}

