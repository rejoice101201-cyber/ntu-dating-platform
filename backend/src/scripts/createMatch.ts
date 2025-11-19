import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createMatch() {
  console.log('💕 开始创建配对...\n');

  // 获取所有用户
  const allUsers = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  if (allUsers.length < 2) {
    console.log('❌ 用户数量不足，无法创建配对');
    return;
  }

  // 第一个用户（通常是你的账户）
  const user1 = allUsers[0];
  
  // 要配对的目标用户列表
  const targetEmails = ['alice@example.com', 'bob@example.com', 'diana@example.com'];
  const targets = targetEmails
    .map(email => allUsers.find(u => u.email === email))
    .filter(Boolean) as typeof allUsers;

  console.log(`👤 主用户: ${user1.name} (${user1.email})\n`);

  let matchCount = 0;

  for (const user2 of targets) {
    if (user2.id === user1.id) continue;

    console.log(`\n📌 处理与 ${user2.name} 的配对...`);

    // 检查是否已经配对
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { userId: user1.id, matchedUserId: user2.id },
          { userId: user2.id, matchedUserId: user1.id },
        ],
      },
    });

    if (existingMatch) {
      console.log(`   ⏭️  已经配对过了，跳过`);
      continue;
    }

    // 创建互相评分（总分 >= 7 才能配对）
    // 用户1给用户2评分 4分
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

    // 用户2给用户1评分 4分（总分 = 8 >= 7，可以配对）
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

    // 创建配对（因为总分 = 8 >= 7）
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

    console.log(`   ✅ 配对成功！总分: ${totalScore}分`);
    matchCount++;
  }

  console.log(`\n🎉 完成！共创建了 ${matchCount} 个配对`);
  console.log(`💬 现在可以在配对页面看到这些用户了！`);
}

createMatch()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

