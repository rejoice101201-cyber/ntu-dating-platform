import type { Metadata } from 'next'
import { Inter, Noto_Sans_TC } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'

const Navigation = dynamic(() => import('@/components/Navigation'), { ssr: false })
const LeftSidebar = dynamic(() => import('@/components/LeftSidebar'), { ssr: false })

// 英文和數字使用 Inter - 現代、清晰、易讀
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',   // 性能優化：字體加載時顯示回退字體
  variable: '--font-inter',
  preload: true, // 預載字體，提升性能
  adjustFontFallback: true, // 自動調整回退字體，減少佈局偏移
})

  // 中文使用 Noto Sans TC - 優雅、現代、易讀
  const notoSansTC = Noto_Sans_TC({
    subsets: ['latin'], // Next.js 會自動處理中文字符
    weight: ['400', '500', '600', '700'],
    display: 'swap', // 性能優化：字體加載時顯示回退字體
    variable: '--font-noto',
    preload: true, // 預載字體，提升性能
    adjustFontFallback: true, // 自動調整回退字體，減少佈局偏移
})

export const metadata: Metadata = {
  title: 'NTU Dating Platform - 找到你的另一半',
  description: '一個注重內在的交友平台，透過互動解鎖照片，找到真正適合的人',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.variable} ${notoSansTC.variable} font-sans`}>
        <LeftSidebar />
        <div className="ml-20">
          {children}
        </div>
        <Navigation />
      </body>
    </html>
  )
}

