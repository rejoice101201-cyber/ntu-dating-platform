import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createMatch() {
  console.log('💕 開始建立配對...\n');

  // 获取所有用户
  const allUsers = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  if (allUsers.length < 2) {
    console.log('❌ 用戶數量不足，無法建立配對');
    return;
  }

  // 為所有真實用戶（非機器人）建立配對
  const botEmails = ['alice@example.com', 'bob@example.com', 'charlie@example.com', 
                     'diana@example.com', 'eve@example.com', 'frank@example.com'];
  const realUsers = allUsers.filter(u => !botEmails.includes(u.email));
  const bots = allUsers.filter(u => botEmails.includes(u.email));

  if (realUsers.length === 0) {
    console.log('❌ 沒有找到真實用戶');
    return;
  }

  console.log(`找到 ${realUsers.length} 個真實用戶，${bots.length} 個機器人\n`);

  let totalMatches = 0;

  // 為每個真實用戶建立配對
  for (const user1 of realUsers) {
    console.log(`\n👤 為用戶 ${user1.name} (${user1.email}) 建立配對...`);
    let matchCount = 0;

    // 選擇前3個機器人進行配對
    const targets = bots.slice(0, 3);

    for (const user2 of targets) {
    if (user2.id === user1.id) continue;

    console.log(`\n📌 處理與 ${user2.name} 的配對...`);

    // 檢查是否已經配對
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { userId: user1.id, matchedUserId: user2.id },
          { userId: user2.id, matchedUserId: user1.id },
        ],
      },
    });

    if (existingMatch) {
      console.log(`   ⏭️  已經配對過了，跳過`);
      continue;
    }

    // 建立互相評分（總分 >= 7 才能配對）
    // 用戶1給用戶2評分 4分
    const rating1 = await prisma.rating.upsert({
      where: {
        userId_ratedUserId: {
          userId: user1.id,
          ratedUserId: user2.id,
        },
      },
      create: {
        userId: user1.id,
        ratedUserId: user2.id,
        score: 4,
      },
      update: {
        score: 4,
      },
    });

    // 用戶2給用戶1評分 4分（總分 = 8 >= 7，可以配對）
    const rating2 = await prisma.rating.upsert({
      where: {
        userId_ratedUserId: {
          userId: user2.id,
          ratedUserId: user1.id,
        },
      },
      create: {
        userId: user2.id,
        ratedUserId: user1.id,
        score: 4,
      },
      update: {
        score: 4,
      },
    });

    // 建立配對（因為總分 = 8 >= 7）
    const totalScore = rating1.score + rating2.score;
    const match = await prisma.match.upsert({
      where: {
        userId_matchedUserId: {
          userId: user1.id,
          matchedUserId: user2.id,
        },
      },
      create: {
        userId: user1.id,
        matchedUserId: user2.id,
        status: 'matched',
        totalScore: totalScore,
        matchedAt: new Date(),
      },
      update: {
        status: 'matched',
        totalScore: totalScore,
        matchedAt: new Date(),
      },
    });

      console.log(`   ✅ 配對成功！總分: ${totalScore}分`);
      matchCount++;
      totalMatches++;
    }

    console.log(`   📊 ${user1.name} 的配對數量: ${matchCount}`);
  }

  console.log(`\n🎉 完成！共建立了 ${totalMatches} 個配對`);
  console.log(`💬 現在所有用戶都可以在配對頁面看到配對了！`);
}

createMatch()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

