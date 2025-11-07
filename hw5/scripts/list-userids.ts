import { PrismaClient } from "../src/generated"

const prisma = new PrismaClient()

async function listUserIDs() {
  try {
    const users = await prisma.user.findMany({
      select: {
        userID: true,
        name: true,
        email: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log("\n=== 所有 UserID 列表 ===\n")
    console.log(`總數: ${users.length}\n`)

    if (users.length === 0) {
      console.log("目前沒有任何已註冊的 userID")
      return
    }

    users.forEach((user, index) => {
      const provider = user.accounts[0]?.provider || "未知"
      console.log(`${index + 1}. UserID: ${user.userID}`)
      console.log(`   名稱: ${user.name || "未設定"}`)
      console.log(`   Email: ${user.email || "未設定"}`)
      console.log(`   Provider: ${provider}`)
      console.log(`   註冊時間: ${user.createdAt.toLocaleString("zh-TW")}`)
      console.log("")
    })
  } catch (error) {
    console.error("查詢錯誤:", error)
  } finally {
    await prisma.$disconnect()
  }
}

listUserIDs()

