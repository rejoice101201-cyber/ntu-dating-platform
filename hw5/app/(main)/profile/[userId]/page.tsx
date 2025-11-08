import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { ProfileTabs } from "@/components/profile/ProfileTabs"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  
  if (!userId) {
    notFound()
  }

  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  // Try to find user by userID first, then by id (UUID)
  // This handles cases where userID is null and we're using id instead
  let user = await db.user.findUnique({
    where: { userID: userId },
    include: {
      _count: {
        select: {
          posts: {
            where: { parentId: null },
          },
          followers: true,
          following: true,
        },
      },
    },
  })

  // If not found by userID, try finding by id (UUID)
  // This handles cases where user hasn't set userID yet
  if (!user) {
    user = await db.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            posts: {
              where: { parentId: null },
            },
            followers: true,
            following: true,
          },
        },
      },
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">使用者不存在</div>
      </div>
    )
  }

  const isOwnProfile = session.user.id === user.id
  const isFollowing = session.user.id
    ? await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: user.id,
          },
        },
      })
    : null

  return (
    <div className="min-h-screen max-w-2xl mx-auto border-x border-gray-800">
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        isFollowing={!!isFollowing}
        followerCount={user._count.followers}
        followingCount={user._count.following}
        postCount={user._count.posts}
      />
      <ProfileTabs userId={user.id} userID={user.userID} isOwnProfile={isOwnProfile} />
    </div>
  )
}

