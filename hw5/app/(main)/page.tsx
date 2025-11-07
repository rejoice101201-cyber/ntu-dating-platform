import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { PostFeed } from "@/components/post/PostFeed"
import { PostComposer } from "@/components/post/PostComposer"

export default async function HomePage() {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  const user = session.user as any
  if (!user.userID) {
    redirect("/auth/register")
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto border-x border-gray-800">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-gray-800 p-4">
        <h1 className="text-xl font-bold">Home</h1>
      </div>

      {/* Post Composer */}
      <div className="border-b border-gray-800 p-4">
        <PostComposer />
      </div>

      {/* Feed Tabs */}
      <div className="flex border-b border-gray-800">
        <button className="flex-1 py-4 text-center font-semibold hover:bg-gray-900 transition-colors border-b-2 border-white">
          For you
        </button>
        <button className="flex-1 py-4 text-center font-semibold hover:bg-gray-900 transition-colors text-gray-500">
          Following
        </button>
      </div>

      {/* Post Feed */}
      <PostFeed />
    </div>
  )
}

