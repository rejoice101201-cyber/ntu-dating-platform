import { Sidebar } from "@/components/sidebar/Sidebar"
import { BackButtonHandler } from "@/components/layout/BackButtonHandler"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 ml-64">
        {children}
      </main>
      <BackButtonHandler />
    </div>
  )
}

