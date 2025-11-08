import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { PostDetail } from "@/components/post/PostDetail"

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>
}) {
  const { postId } = await params
  
  if (!postId) {
    notFound()
  }

  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }
  
  if (!session.user) {
    redirect("/auth/signin")
  }
  
  if (!session.user.id) {
    redirect("/auth/signin")
  }

  const userId = session.user.id

  const post = await db.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          userID: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          reposts: true,
          comments: true,
        },
      },
    },
  })

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Post not found</div>
      </div>
    )
  }

  // Get user's like/repost status
  const [like, repost] = await Promise.all([
    db.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: post.id,
        },
      },
    }),
    db.repost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: post.id,
        },
      },
    }),
  ])

  // Get comments
  const comments = await db.post.findMany({
    where: { parentId: postId },
    include: {
      author: {
        select: {
          id: true,
          userID: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          reposts: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Check which comments are liked/reposted by current user
  const commentIds = comments.map((c) => c.id)
  const [commentLikes, commentReposts] = await Promise.all([
    db.like.findMany({
      where: {
        userId,
        postId: { in: commentIds },
      },
      select: { postId: true },
    }),
    db.repost.findMany({
      where: {
        userId,
        postId: { in: commentIds },
      },
      select: { postId: true },
    }),
  ])

  const likedCommentIds = new Set(commentLikes.map((l) => l.postId))
  const repostedCommentIds = new Set(commentReposts.map((r) => r.postId))

  const commentsWithStatus = comments.map((comment) => ({
    ...comment,
    isLiked: likedCommentIds.has(comment.id),
    isReposted: repostedCommentIds.has(comment.id),
  }))

  return (
    <div className="min-h-screen border-x border-gray-800">
      <PostDetail
        post={{
          ...post,
          isLiked: !!like,
          isReposted: !!repost,
        }}
        comments={commentsWithStatus}
      />
    </div>
  )
}

