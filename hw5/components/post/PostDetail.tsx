"use client"

import { useRouter } from "next/navigation"
import { PostCard } from "./PostCard"
import { PostComposer } from "./PostComposer"
import { PostWithAuthor } from "@/types"

interface PostDetailProps {
  post: PostWithAuthor & { isLiked?: boolean; isReposted?: boolean }
  comments: PostWithAuthor[]
}

export function PostDetail({ post, comments }: PostDetailProps) {
  const router = useRouter()

  return (
    <div>
      {/* Header with back arrow */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-gray-800 p-4 flex items-center gap-4 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-900 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-bold">Post</span>
      </div>

      {/* Main post */}
      <PostCard post={post} />

      {/* Comment composer */}
      <div className="border-b border-gray-800 p-4">
        <PostComposer parentId={post.id} />
      </div>

      {/* Comments */}
      <div>
        {comments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No comments yet</div>
        ) : (
          comments.map((comment) => (
            <PostCard key={comment.id} post={comment} />
          ))
        )}
      </div>
    </div>
  )
}

