import type { Metadata } from 'next'
import { Press_Start_2P } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'

const Navigation = dynamic(() => import('@/components/Navigation'), { ssr: false })
const LeftSidebar = dynamic(() => import('@/components/LeftSidebar'), { ssr: false })

const pixelFont = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
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
  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/layout.tsx:RootLayout',message:'RootLayout rendering',data:{hasLeftSidebar:true,hasNavigation:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{})
  }
  // #endregion
  return (
    <html lang="zh-TW">
      <body className={pixelFont.className}>
        <LeftSidebar />
        <div className="ml-20">
          {children}
        </div>
        <Navigation />
      </body>
    </html>
  )
}

