import type { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import FacebookProvider from "next-auth/providers/facebook"
import { db } from "./db"
import { isValidUserID } from "./utils"

// Validate required environment variables
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  FACEBOOK_ID: process.env.FACEBOOK_ID,
  FACEBOOK_SECRET: process.env.FACEBOOK_SECRET,
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
}

// Log missing environment variables for debugging
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  console.error("[NextAuth] Missing environment variables:", missingVars)
}

// Log secret status for debugging
if (!requiredEnvVars.AUTH_SECRET) {
  console.error("[NextAuth] AUTH_SECRET is missing! This will cause Configuration errors.")
} else {
  console.log("[NextAuth] AUTH_SECRET is set (length:", requiredEnvVars.AUTH_SECRET.length, ")")
}

// Custom adapter that extends PrismaAdapter to handle userID field
const baseAdapter = PrismaAdapter(db) as any

const customAdapter = {
  ...baseAdapter,
  async createUser(data: any) {
    // Remove userID from data if present, as it should be null initially
    // and set later in the registration page
    // Now that Prisma Client types are correct, we can simply omit userID
    const { userID, ...userData } = data
    
    // Create user without userID - Prisma will use NULL as default
    return db.user.create({
      data: userData,
    })
  },
}

export const authOptions: NextAuthConfig = {
  adapter: customAdapter,
  trustHost: true, // Required for NextAuth v5
  secret: requiredEnvVars.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // Enable debug mode in development
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID!,
      clientSecret: process.env.FACEBOOK_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // Log sign-in attempts for debugging
      console.log("[NextAuth] Sign-in attempt:", {
        userId: user?.id,
        email: user?.email,
        provider: account?.provider,
        accountId: account?.providerAccountId,
      })
      
      // Check if user has required fields
      if (!user?.email && !user?.id) {
        console.error("[NextAuth] User missing required fields:", user)
        return false
      }
      
      // Check if this provider account already exists
      // If it exists, use the existing user (normal login)
      // If it doesn't exist, let PrismaAdapter create a new user (even if email is the same)
      // This allows each OAuth provider to create independent accounts
      if (account) {
        const existingAccount = await db.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          include: { user: true },
        })
        
        if (existingAccount) {
          // This provider account already exists, use the existing user
          user.id = existingAccount.user.id
          console.log("[NextAuth] Using existing account:", {
            userId: existingAccount.user.id,
            provider: account.provider,
            accountId: account.providerAccountId,
          })
        }
        // If account doesn't exist, let PrismaAdapter create a new user
        // This allows multiple users with the same email but different providers
      }
      
      // Note: OAuth 認證失敗（錯誤的帳密）會由 OAuth provider 直接拒絕
      // NextAuth.js 會自動處理並重定向到錯誤頁面
      // 這裡我們只處理成功的認證流程
      
      // Allow sign in - we'll handle userID registration separately
      return true
    },
    async jwt({ token, user, account }: any) {
      // Log JWT callback for debugging
      if (user) {
        console.log("[NextAuth] JWT callback - user:", user.id)
        token.id = user.id
      }
      return token
    },
    async session({ session, user }: any) {
      if (session.user && user) {
        (session.user as any).id = user.id
        // Fetch userID from database
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { userID: true },
        })
        if (dbUser) {
          (session.user as any).userID = dbUser.userID
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle redirect after OAuth login
      // If URL is /auth/link-account/complete, user is trying to link accounts
      // We need to allow this redirect and handle linking in signIn callback
      if (url.includes("/auth/link-account/complete")) {
        return url
      }
      
      // If URL is /auth/register but user already has userID, redirect to home
      if (url === `${baseUrl}/auth/register`) {
        // We can't check userID here directly, so we'll let the register page handle it
        return url
      }
      // If redirecting to home or other pages, allow it
      if (url.startsWith(baseUrl)) {
        return url
      }
      // Default to home
      return baseUrl
    },
    async authorized({ request, auth }) {
      // This callback is called before signIn callback
      // We can use it to handle special cases
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
    // Implement sliding expiration mechanism similar to X (Twitter)
    // maxAge: Session 的最大生命週期（7 天）
    // updateAge: 每次活動時更新過期時間的間隔（24 小時）
    // 如果用戶在 24 小時內有活動，Session 會自動延長，最多到 7 天
    // 如果用戶超過 24 小時沒有活動，Session 會在 7 天後過期
    maxAge: 7 * 24 * 60 * 60, // 7 days - maximum session lifetime
    updateAge: 24 * 60 * 60, // 24 hours - sliding expiration window
    // 如果滑動過期機制有問題，可以改為固定 10 分鐘：
    // maxAge: 10 * 60, // 10 minutes
    // updateAge: 10 * 60, // 10 minutes
  },
}

