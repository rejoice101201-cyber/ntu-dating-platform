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
    const { userID, originalEmail, ...userData } = data;
    // 使用 modified email 作為 email，原始存到 originalEmail
    return db.user.create({
      data: {
        ...userData,
        originalEmail: originalEmail || userData.email,  // fallback
      },
    });
  },
  // 覆寫 getUserByAccount，添加調試日誌
  // 注意：我們不能簡單地返回 null，因為 PrismaAdapter 期望找到 account 時返回用戶
  // 真正的解決方案是在 signIn callback 中處理，或者清理資料庫中錯誤連結的 account
  async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
    console.log("[CustomAdapter] getUserByAccount called:", { provider, providerAccountId });
    // 使用 baseAdapter 的方法，但添加日誌
    const result = await baseAdapter.getUserByAccount({ providerAccountId, provider });
    if (result) {
      console.log("[CustomAdapter] Found existing account, userId:", result.id);
      // 檢查這個用戶是否有其他 provider 的 account
      const userAccounts = await db.account.findMany({
        where: { userId: result.id },
        select: { provider: true },
      });
      if (userAccounts.length > 1) {
        console.log("[CustomAdapter] WARNING: User has multiple provider accounts:", userAccounts.map(a => a.provider));
        console.log("[CustomAdapter] This user was incorrectly linked. Consider cleaning the database.");
      }
    } else {
      console.log("[CustomAdapter] No existing account found, will create new user");
    }
    return result;
  },
  // 覆寫 getUserByEmail，防止根據 email 自動連結帳號
  // 我們希望每個 OAuth provider 創建獨立的用戶，即使 email 相同
  async getUserByEmail(email: string) {
    console.log("[CustomAdapter] getUserByEmail called with:", email);
    console.log("[CustomAdapter] Returning null to prevent auto-linking by email");
    // 永遠返回 null，強制創建新用戶
    // 這樣可以確保不同 provider 的相同 email 會創建不同的用戶
    return null;
  },
  // 覆寫 linkAccount，防止自動連結帳號
  // 我們希望每個 OAuth provider 創建獨立的用戶
  async linkAccount(account: any) {
    console.log("[CustomAdapter] linkAccount called for provider:", account?.provider);
    // 只創建 account，不連結到現有用戶
    // 這個方法會在 createUser 之後被調用，所以 account 會連結到新創建的用戶
    return baseAdapter.linkAccount(account);
  },
};

// Build providers array conditionally based on available environment variables
const providers = [
  // Only add provider if both clientId and clientSecret are available
  ...(requiredEnvVars.GOOGLE_CLIENT_ID && requiredEnvVars.GOOGLE_CLIENT_SECRET
    ? [GoogleProvider({
        clientId: requiredEnvVars.GOOGLE_CLIENT_ID,
        clientSecret: requiredEnvVars.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      })]
    : []),
  ...(requiredEnvVars.GITHUB_ID && requiredEnvVars.GITHUB_SECRET
    ? [GitHubProvider({
        clientId: requiredEnvVars.GITHUB_ID,
        clientSecret: requiredEnvVars.GITHUB_SECRET,
        allowDangerousEmailAccountLinking: true,
      })]
    : []),
  ...(requiredEnvVars.FACEBOOK_ID && requiredEnvVars.FACEBOOK_SECRET
    ? [FacebookProvider({
        clientId: requiredEnvVars.FACEBOOK_ID,
        clientSecret: requiredEnvVars.FACEBOOK_SECRET,
        allowDangerousEmailAccountLinking: true,
      })]
    : []),
]

// Log enabled providers for debugging
const enabledProviders = providers.map((p: any) => p.id || p.name || "unknown").filter(Boolean)
console.log("[NextAuth] Enabled providers:", enabledProviders)
if (enabledProviders.length === 0) {
  console.error("[NextAuth] WARNING: No OAuth providers configured! Check environment variables.")
  if (process.env.NODE_ENV === "production") {
    console.error("[NextAuth] CRITICAL: Missing OAuth environment variables in production!")
  }
} else {
  console.log(`[NextAuth] Successfully configured ${enabledProviders.length} OAuth provider(s)`)
}

export const authOptions: NextAuthConfig = {
  adapter: customAdapter,
  trustHost: true, // Required for NextAuth v5
  secret: requiredEnvVars.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // Enable debug mode in development
  providers,
  callbacks: {
    async signIn({ user, account, profile }: any) {
      console.log("[NextAuth] Sign-in attempt:", {
        userId: user?.id,
        email: user?.email,
        provider: account?.provider,
        accountId: account?.providerAccountId,
      });
      
      if (!user?.email && !user?.id) {
        console.error("[NextAuth] User missing required fields:", user);
        return false;
      }
      
      if (account && profile) {
        const originalEmail = user.email || profile.email;
        if (originalEmail) {
          // 使 email unique per provider，避免合併
          user.email = `${originalEmail}#${account.provider}`;
          // 暫存原始 email 到 user object，供 createUser 使用
          user.originalEmail = originalEmail;
        }
      }
      
      if (account) {
        const existingAccount = await db.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          include: { 
            user: {
              include: {
                accounts: {
                  select: { provider: true },
                },
              },
            },
          },
        });
        
        if (existingAccount) {
          // 檢查這個用戶是否有其他 provider 的 account
          const otherProviders = existingAccount.user.accounts.filter(
            (acc: any) => acc.provider !== account.provider
          );
          
          if (otherProviders.length > 0) {
            console.error("[NextAuth] ERROR: User has multiple provider accounts:", {
              userId: existingAccount.user.id,
              currentProvider: account.provider,
              otherProviders: otherProviders.map((acc: any) => acc.provider),
            });
            console.error("[NextAuth] This user was incorrectly linked. The account should be separated.");
            // 拒絕登入，強制用戶重新註冊
            // 或者，我們可以刪除錯誤連結的 account，但這很危險
            return false;
          }
          
          user.id = existingAccount.user.id;
          console.log("[NextAuth] Using existing account:", {
            userId: existingAccount.user.id,
            provider: account.provider,
            accountId: account.providerAccountId,
          });
          return true;
        }
        // 如果不存在，讓 adapter 創建新用戶（現在 email 是 unique 的）
      }
      
      return true;
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
        (session.user as any).id = user.id;
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { userID: true, originalEmail: true },
        });
        if (dbUser) {
          (session.user as any).userID = dbUser.userID;
          (session.user as any).originalEmail = dbUser.originalEmail;
        }
      }
      return session;
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
  events: {
    async signIn({ user, account, profile }) {
      console.log("[NextAuth] Sign-in successful:", {
        userId: user?.id,
        email: user?.email,
        provider: account?.provider,
        accountId: account?.providerAccountId,
      });
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

