import { Sidebar } from "@/components/sidebar/Sidebar"
import { RightSidebar } from "@/components/sidebar/RightSidebar"
import { BackButtonHandler } from "@/components/layout/BackButtonHandler"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen overflow-hidden bg-black text-white">
      {/* 外層容器：限制最大寬度並居中，類似 X.com */}
      <div className="max-w-[1400px] mx-auto flex h-screen">
        {/* Left Sidebar - 固定不滾動 */}
        <div className="w-64 flex-shrink-0 border-r border-gray-800 overflow-hidden">
          <Sidebar />
        </div>
        
        {/* Main Content Area - 只有這裡可以滾動 */}
        <main className="flex-1 min-w-0 h-screen overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* Right Sidebar - 固定不滾動 */}
        <div className="w-80 flex-shrink-0 border-l border-gray-800 overflow-hidden">
          <RightSidebar />
        </div>
      </div>
      
      <BackButtonHandler />
    </div>
  )
}

