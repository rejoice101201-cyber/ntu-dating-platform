import { Session } from "next-auth"

export interface ExtendedSession extends Session {
  user: {
    id: string
    userID?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export interface PostWithAuthor {
  id: string
  content: string
  createdAt: Date
  author: {
    id: string
    userID: string | null
    name: string | null
    image: string | null
  }
  parentId: string | null
  _count: {
    likes: number
    reposts: number
    comments: number
  }
  isLiked?: boolean
  isReposted?: boolean
  isRepost?: boolean
  repostedBy?: {
    id: string
    userID: string | null
    name: string | null
    image: string | null
  }
  repostedAt?: Date
}

