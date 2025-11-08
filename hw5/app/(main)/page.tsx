import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { PostComposer } from "@/components/post/PostComposer"
import { FeedTabs } from "@/components/home/FeedTabs"

export default async function HomePage() {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }
  
  if (!session.user) {
    redirect("/auth/signin")
  }

  const user = session.user as any
  if (!user.userID) {
    redirect("/auth/register")
  }

  return (
    <div className="min-h-screen border-x border-gray-800">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-gray-800 p-4">
        <h1 className="text-xl font-bold">Home</h1>
      </div>

      {/* Post Composer */}
      <div className="border-b border-gray-800 p-4">
        <PostComposer />
      </div>

      {/* Feed Tabs and Post Feed */}
      <FeedTabs />
    </div>
  )
}

