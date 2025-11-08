/**
 * 清理腳本：分離錯誤連結的 OAuth account
 * 
 * 這個腳本會找出所有有多個 provider account 的用戶，
 * 並為每個 provider 創建獨立的用戶。
 * 
 * 使用方法：
 * npx tsx scripts/cleanup-linked-accounts.ts
 */

import { PrismaClient } from '@/src/generated/client'

const prisma = new PrismaClient()

async function cleanupLinkedAccounts() {
  console.log('開始清理錯誤連結的 account...')
  
  // 找出所有有多個 provider account 的用戶
  const usersWithMultipleAccounts = await prisma.user.findMany({
    include: {
      accounts: {
        select: {
          id: true,
          provider: true,
          providerAccountId: true,
        },
      },
    },
  })
  
  const usersToFix = usersWithMultipleAccounts.filter(
    (user) => user.accounts.length > 1
  )
  
  console.log(`找到 ${usersToFix.length} 個有多個 provider account 的用戶`)
  
  for (const user of usersToFix) {
    console.log(`\n處理用戶 ${user.id}:`)
    console.log(`  - Email: ${user.email}`)
    console.log(`  - UserID: ${user.userID}`)
    console.log(`  - Accounts: ${user.accounts.map((acc) => acc.provider).join(', ')}`)
    
    // 保留第一個 account，為其他 account 創建新用戶
    const [firstAccount, ...otherAccounts] = user.accounts
    
    console.log(`  - 保留 account: ${firstAccount.provider}`)
    
    for (const account of otherAccounts) {
      console.log(`  - 為 ${account.provider} 創建新用戶...`)
      
      // 創建新用戶，使用修改後的 email
      const newEmail = user.email?.replace(/#.*$/, '') || `user_${Date.now()}@example.com`
      const providerEmail = `${newEmail}#${account.provider}`
      
      const newUser = await prisma.user.create({
        data: {
          email: providerEmail,
          originalEmail: newEmail,
          name: user.name,
          image: user.image,
          bio: user.bio,
          banner: user.banner,
          // 不複製 userID，讓新用戶重新註冊
        },
      })
      
      // 更新 account 的 userId
      await prisma.account.update({
        where: { id: account.id },
        data: { userId: newUser.id },
      })
      
      console.log(`    ✓ 創建新用戶 ${newUser.id} 並移動 ${account.provider} account`)
    }
  }
  
  console.log('\n清理完成！')
}

cleanupLinkedAccounts()
  .catch((error) => {
    console.error('清理過程中發生錯誤:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

