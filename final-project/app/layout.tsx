import type { Metadata } from 'next'
import { Inter, Noto_Sans_TC } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'

const Navigation = dynamic(() => import('@/components/Navigation'), { ssr: false })
const LeftSidebar = dynamic(() => import('@/components/LeftSidebar'), { ssr: false })

// 英文和数字使用 Inter - 现代、清晰、易读
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
})

// 中文使用 Noto Sans TC - 优雅、现代、易读
const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto',
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

