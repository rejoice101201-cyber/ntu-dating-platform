"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { EditProfileModal } from "./EditProfileModal"
import { FollowButton } from "./FollowButton"

interface ProfileHeaderProps {
  user: {
    id: string
    userID: string | null
    name: string | null
    image: string | null
    bio: string | null
    banner: string | null
  }
  isOwnProfile: boolean
  isFollowing: boolean
  followerCount: number
  followingCount: number
  postCount: number
}

export function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing,
  followerCount,
  followingCount,
  postCount,
}: ProfileHeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)

  return (
    <>
      {/* Back Arrow */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-gray-800 p-4 flex items-center gap-4 z-0">
        <Link
          href="/"
          className="p-2 hover:bg-gray-900 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <div className="font-bold">{user.name}</div>
          <div className="text-sm text-gray-500">{postCount} {postCount === 1 ? 'post' : 'posts'}</div>
        </div>
      </div>

      {/* Banner */}
      <div className="relative h-48 bg-gray-800">
        {user.banner && (
          <img
            src={user.banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Avatar and Edit Button */}
      <div className="px-4 pb-4 border-b border-gray-800">
        <div className="relative flex justify-between items-end -mt-16 mb-4 z-0">
          <img
            src={user.image || "/default-avatar.png"}
            alt={user.name || "User"}
            className="w-32 h-32 rounded-full border-4 border-black object-cover relative z-0"
          />
          {isOwnProfile ? (
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 border border-gray-700 rounded-full font-semibold hover:bg-gray-900 transition-colors"
            >
              Edit profile
            </button>
          ) : (
            <FollowButton
              userId={user.id}
              isFollowing={isFollowing}
            />
          )}
        </div>

        {/* User Info */}
        <div className="space-y-2">
          <div>
            <div className="text-xl font-bold">{user.name}</div>
            <div className="text-gray-500">@{user.userID}</div>
          </div>
          {user.bio && (
            <div className="text-gray-300">{user.bio}</div>
          )}
          <div className="flex gap-4 text-sm">
            <span className="text-gray-500">
              <span className="text-white font-semibold">{followerCount}</span> Following
            </span>
            <span className="text-gray-500">
              <span className="text-white font-semibold">{followingCount}</span> Followers
            </span>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  )
}

