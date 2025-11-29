import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'

const Navigation = dynamic(() => import('@/components/Navigation'), { ssr: false })

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        {children}
        <Navigation />
      </body>
    </html>
  )
}

