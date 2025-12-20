'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  type = 'button',
  size = 'md',
}: ButtonProps) {
  const baseClasses = 'text-sm font-bold border-3 border-[var(--pixel-border)] shadow-[3px_3px_0_rgba(0,0,0,0.25)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-[var(--pixel-highlight)] text-white hover:bg-[#0284c7]',
    secondary: 'bg-[var(--pixel-panel)] text-[var(--pixel-text)] hover:bg-[var(--pixel-surface)]',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      whileHover={!disabled ? { 
        scale: 1.02,
        boxShadow: '4px 4px 0 rgba(0,0,0,0.25)',
        y: -1,
        x: -1,
      } : {}}
      whileTap={!disabled ? { 
        scale: 0.98,
        boxShadow: '2px 2px 0 rgba(0,0,0,0.25)',
        y: 0,
        x: 0,
      } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  )
}

