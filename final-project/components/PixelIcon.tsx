'use client'

import React from 'react'

type IconType = 'home' | 'search' | 'saved' | 'my' | 'discover' | 'matches' | 'profile' | 'wall' | 'logout'

interface PixelIconProps {
  type: IconType
  className?: string
}

export default function PixelIcon({ type, className = '' }: PixelIconProps) {
  // 像素風格圖標，模仿圖片中的 8-bit 風格
  const renderIcon = () => {
    switch (type) {
      case 'home':
        // 金色星星 - 像素風格
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
            <path d="M10 1L12 7L18 8L13 12L14 18L10 15L6 18L7 12L2 8L8 7L10 1Z" fill="#fbbf24" stroke="#92400e" strokeWidth="1"/>
            <path d="M10 3L11.5 7.5L16 8L12.5 11L13.5 15.5L10 13L6.5 15.5L7.5 11L4 8L8.5 7.5L10 3Z" fill="#f59e0b"/>
            <rect x="9" y="9" width="2" height="2" fill="#ffffff" opacity="0.6"/>
          </svg>
        )
      case 'search':
        // 藍色鑽石 - 像素風格
        return (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
            <path d="M9 0L18 9L9 18L0 9L9 0Z" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.5"/>
            <path d="M9 2L16 9L9 16L2 9L9 2Z" fill="#3b82f6"/>
            <rect x="7" y="7" width="4" height="4" fill="#1e40af"/>
            <rect x="8" y="8" width="2" height="2" fill="#ffffff" opacity="0.5"/>
          </svg>
        )
      case 'saved':
        // 灰色軟碟 - 像素風格
        return (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
            <rect x="2" y="2" width="14" height="14" fill="#9ca3af" stroke="#4b5563" strokeWidth="1.5"/>
            <rect x="4" y="4" width="10" height="7" fill="#d1d5db"/>
            <rect x="6" y="12" width="6" height="2" fill="#6b7280"/>
            <rect x="7" y="14" width="4" height="2" fill="#4b5563"/>
            <rect x="5" y="5" width="8" height="1" fill="#ffffff" opacity="0.3"/>
          </svg>
        )
      case 'my':
        // 灰色盾牌 - 像素風格
        return (
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
            <path d="M8 0L16 5V11C16 15 8 20 8 20C8 20 0 15 0 11V5L8 0Z" fill="#9ca3af" stroke="#4b5563" strokeWidth="1.5"/>
            <path d="M8 2L14 6V11C14 14 8 18 8 18C8 18 2 14 2 11V6L8 2Z" fill="#d1d5db"/>
            <path d="M8 5L10.5 7V9C10.5 10 8 11.5 8 11.5C8 11.5 5.5 10 5.5 9V7L8 5Z" fill="#ffffff" stroke="#6b7280" strokeWidth="0.5"/>
          </svg>
        )
      case 'discover':
        // 金色星星 - 像素風格
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
            <path d="M10 1L12 7L18 8L13 12L14 18L10 15L6 18L7 12L2 8L8 7L10 1Z" fill="#fbbf24" stroke="#92400e" strokeWidth="1"/>
            <path d="M10 3L11.5 7.5L16 8L12.5 11L13.5 15.5L10 13L6.5 15.5L7.5 11L4 8L8.5 7.5L10 3Z" fill="#f59e0b"/>
            <rect x="9" y="9" width="2" height="2" fill="#ffffff" opacity="0.6"/>
          </svg>
        )
      case 'matches':
        // 紅色愛心 - 像素風格
        return (
          <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
            <path d="M9 14C9 14 2 9 2 6C2 4 3.5 2.5 5.5 2.5C6.5 2.5 7.5 3 9 4C10.5 3 11.5 2.5 12.5 2.5C14.5 2.5 16 4 16 6C16 9 9 14 9 14Z" fill="#ef4444" stroke="#dc2626" strokeWidth="1.5"/>
            <path d="M9 14C9 14 3 9.5 3 7C3 5.5 4 4.5 5.5 4.5C6.2 4.5 7 5 9 6C11 5 11.8 4.5 12.5 4.5C14 4.5 15 5.5 15 7C15 9.5 9 14 9 14Z" fill="#dc2626" opacity="0.7"/>
          </svg>
        )
      case 'profile':
        // 灰色盾牌 - 像素風格
        return (
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
            <path d="M8 0L16 5V11C16 15 8 20 8 20C8 20 0 15 0 11V5L8 0Z" fill="#9ca3af" stroke="#4b5563" strokeWidth="1.5"/>
            <path d="M8 2L14 6V11C14 14 8 18 8 18C8 18 2 14 2 11V6L8 2Z" fill="#d1d5db"/>
            <path d="M8 5L10.5 7V9C10.5 10 8 11.5 8 11.5C8 11.5 5.5 10 5.5 9V7L8 5Z" fill="#ffffff" stroke="#6b7280" strokeWidth="0.5"/>
          </svg>
        )
      case 'wall':
        // 銀色劍 - 像素風格
        return (
          <svg width="6" height="20" viewBox="0 0 6 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
            <rect x="2" y="0" width="2" height="15" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>
            <rect x="1" y="2" width="4" height="1.5" fill="#d1d5db"/>
            <rect x="0" y="15" width="6" height="3" fill="#92400e" stroke="#78350f" strokeWidth="0.5"/>
            <rect x="2" y="17" width="2" height="1.5" fill="#f59e0b"/>
            <rect x="1" y="1" width="4" height="1" fill="#ffffff" opacity="0.3"/>
          </svg>
        )
      case 'logout':
        // 黑色炸彈 - 像素風格
        return (
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
            <circle cx="8" cy="10" r="7" fill="#1f2937" stroke="#111827" strokeWidth="1.5"/>
            <circle cx="8" cy="10" r="5" fill="#374151" opacity="0.6"/>
            <rect x="6" y="2" width="4" height="3" fill="#92400e"/>
            <rect x="7" y="1" width="2" height="2" fill="#f59e0b"/>
            <rect x="7.5" y="0.5" width="1" height="1" fill="#fbbf24"/>
            <rect x="5.5" y="2.5" width="5" height="1" fill="#78350f"/>
            <rect x="6" y="8" width="4" height="1" fill="#ffffff" opacity="0.2"/>
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      {renderIcon()}
    </span>
  )
}

