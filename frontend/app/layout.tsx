import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'

const Navigation = dynamic(() => import('@/components/Navigation'), { ssr: false })

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NTU Dating Platform - 找到你的另一半',
  description: '一个注重内在的交友平台，通过互动解锁照片，找到真正适合的人',
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

