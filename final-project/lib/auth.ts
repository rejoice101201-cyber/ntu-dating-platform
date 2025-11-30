import type { NextAuthConfig } from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './mongodb'; // 使用標準的 MongoDB 連接文件
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import connectDB from './db';
import { isValidUserID } from './utils';
import User from '@/models/User';

// Validate required environment variables
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  FACEBOOK_ID: process.env.FACEBOOK_ID,
  FACEBOOK_SECRET: process.env.FACEBOOK_SECRET,
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

// Log missing environment variables for debugging
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('[NextAuth] Missing environment variables:', missingVars);
}

// Log secret status for debugging
if (!requiredEnvVars.AUTH_SECRET) {
  console.error('[NextAuth] AUTH_SECRET is missing! This will cause Configuration errors.');
} else {
  console.log('[NextAuth] AUTH_SECRET is set (length:', requiredEnvVars.AUTH_SECRET.length, ')');
}

// 使用標準的 MongoDB 連接文件 (lib/mongodb.ts)
// Custom adapter that extends MongoDBAdapter
const baseAdapter = MongoDBAdapter(clientPromise) as any;

const customAdapter = {
  ...baseAdapter,
  async createUser(data: any) {
    const { userID, originalEmail, ...userData } = data;
    // 確保 email 是 unique per provider
    const email = userData.email || '';
    const modifiedEmail = email.includes('#') ? email : `${email}#${data.provider || 'unknown'}`;
    
    return User.create({
      ...userData,
      email: modifiedEmail,
      originalEmail: originalEmail || email,
    });
  },
  async getUserByEmail(email: string) {
    // 永遠返回 null，強制創建新用戶
    // 這樣可以確保不同 provider 的相同 email 會創建不同的用戶
    return null;
  },
};

// Build providers array conditionally based on available environment variables
const providers = [
  ...(requiredEnvVars.GOOGLE_CLIENT_ID && requiredEnvVars.GOOGLE_CLIENT_SECRET
    ? [
        GoogleProvider({
          clientId: requiredEnvVars.GOOGLE_CLIENT_ID,
          clientSecret: requiredEnvVars.GOOGLE_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
  ...(requiredEnvVars.FACEBOOK_ID && requiredEnvVars.FACEBOOK_SECRET
    ? [
        FacebookProvider({
          clientId: requiredEnvVars.FACEBOOK_ID,
          clientSecret: requiredEnvVars.FACEBOOK_SECRET,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
];

// Log enabled providers for debugging
const enabledProviders = providers.map((p: any) => p.id || p.name || 'unknown').filter(Boolean);
console.log('[NextAuth] Enabled providers:', enabledProviders);
if (enabledProviders.length === 0) {
  console.error('[NextAuth] WARNING: No OAuth providers configured! Check environment variables.');
  if (process.env.NODE_ENV === 'production') {
    console.error('[NextAuth] CRITICAL: Missing OAuth environment variables in production!');
  }
} else {
  console.log(`[NextAuth] Successfully configured ${enabledProviders.length} OAuth provider(s)`);
}

export const authOptions: NextAuthConfig = {
  adapter: customAdapter,
  trustHost: true, // Required for NextAuth v5
  secret: requiredEnvVars.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  providers,
  callbacks: {
    async signIn({ user, account, profile }: any) {
      try {
        console.log('[NextAuth] Sign-in attempt:', {
          userId: user?.id,
          email: user?.email,
          provider: account?.provider,
          accountId: account?.providerAccountId,
        });

        if (!user?.email && !user?.id) {
          console.error('[NextAuth] User missing required fields:', user);
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

        return true;
      } catch (error: any) {
        console.error('[NextAuth] Unexpected error in signIn callback:', {
          error: error?.message,
          stack: error?.stack,
          provider: account?.provider,
          userId: user?.id,
          email: user?.email,
        });
        return false;
      }
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        console.log('[NextAuth] JWT callback - user:', user.id);
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      try {
        if (session.user && token?.id) {
          (session.user as any).id = token.id;
          try {
            await connectDB();
            const dbUser = await User.findById(token.id).select('userID originalEmail');
            if (dbUser) {
              (session.user as any).userID = dbUser.userID;
              (session.user as any).originalEmail = dbUser.originalEmail;
            }
          } catch (dbError: any) {
            console.error('[NextAuth] Database error in session callback:', {
              error: dbError?.message,
              stack: dbError?.stack,
              userId: token.id,
            });
          }
        }
        return session;
      } catch (error: any) {
        console.error('[NextAuth] Unexpected error in session callback:', {
          error: error?.message,
          stack: error?.stack,
          userId: token?.id,
        });
        return session;
      }
    },
    async redirect({ url, baseUrl }) {
      // 如果 URL 包含 /auth/register，允許跳轉
      if (url.includes('/auth/register')) {
        return url;
      }
      // 如果 URL 是相對路徑或同源，允許跳轉
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // 如果 URL 是相對路徑（以 / 開頭），組合 baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // 預設返回 baseUrl
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
};

