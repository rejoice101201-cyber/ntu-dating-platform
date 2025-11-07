import { PrismaClient } from "../src/generated"
import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") })

const prisma = new PrismaClient()

async function debugOAuth() {
  console.log("\n=== OAuth 配置檢查 ===\n")

  // Check environment variables
  const envVars = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    FACEBOOK_ID: process.env.FACEBOOK_ID,
    FACEBOOK_SECRET: process.env.FACEBOOK_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL ? "已設置" : "未設置",
  }

  console.log("環境變數檢查:")
  console.log("✅ GOOGLE_CLIENT_ID:", envVars.GOOGLE_CLIENT_ID ? `${envVars.GOOGLE_CLIENT_ID.substring(0, 20)}...` : "❌ 未設置")
  console.log("✅ GOOGLE_CLIENT_SECRET:", envVars.GOOGLE_CLIENT_SECRET ? "已設置" : "❌ 未設置")
  console.log("✅ GITHUB_ID:", envVars.GITHUB_ID ? envVars.GITHUB_ID : "❌ 未設置")
  console.log("✅ GITHUB_SECRET:", envVars.GITHUB_SECRET ? "已設置" : "❌ 未設置")
  console.log("✅ FACEBOOK_ID:", envVars.FACEBOOK_ID ? envVars.FACEBOOK_ID : "❌ 未設置")
  console.log("✅ FACEBOOK_SECRET:", envVars.FACEBOOK_SECRET ? "已設置" : "❌ 未設置")
  console.log("✅ NEXTAUTH_URL:", envVars.NEXTAUTH_URL || "❌ 未設置")
  console.log("✅ NEXTAUTH_SECRET:", envVars.NEXTAUTH_SECRET ? (envVars.NEXTAUTH_SECRET === "changeme_replace_with_random_base64" ? "⚠️  使用預設值（建議更換）" : "已設置") : "❌ 未設置")
  console.log("✅ DATABASE_URL:", envVars.DATABASE_URL)

  // Check database connection
  console.log("\n資料庫連線檢查:")
  try {
    await prisma.$connect()
    console.log("✅ 資料庫連線成功")

    // Check if tables exist
    const userCount = await prisma.user.count()
    const accountCount = await prisma.account.count()
    console.log(`✅ 用戶數量: ${userCount}`)
    console.log(`✅ OAuth 帳戶數量: ${accountCount}`)
  } catch (error: any) {
    console.log("❌ 資料庫連線失敗:", error.message)
  }

  // Expected callback URLs
  console.log("\n預期的 OAuth Redirect URIs:")
  const baseUrl = envVars.NEXTAUTH_URL || "http://localhost:3000"
  console.log(`Google: ${baseUrl}/api/auth/callback/google`)
  console.log(`GitHub: ${baseUrl}/api/auth/callback/github`)
  console.log(`Facebook: ${baseUrl}/api/auth/callback/facebook`)

  console.log("\n=== 檢查完成 ===\n")
  console.log("請確認:")
  console.log("1. 所有環境變數都已正確設置")
  console.log("2. OAuth provider 後台的 redirect URI 與上方顯示的一致")
  console.log("3. 資料庫連線正常")
  console.log("4. 查看終端機的錯誤日誌以獲取更多資訊\n")

  await prisma.$disconnect()
}

debugOAuth().catch(console.error)

