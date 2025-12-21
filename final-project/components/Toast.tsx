'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = type === 'success' 
    ? 'bg-green-500' 
    : type === 'error' 
    ? 'bg-red-500' 
    : 'bg-[var(--pixel-highlight)]'

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className={`${bgColor} text-white px-6 py-3 border-3 border-[var(--pixel-border)] shadow-[4px_4px_0_rgba(0,0,0,0.25)] font-bold text-sm max-w-md`}>
        {message}
      </div>
    </div>
  )
}
