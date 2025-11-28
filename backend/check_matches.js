const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMatches() {
  // 获取所有用户
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: 'asc' },
  });
  
  console.log('所有用户:');
  users.forEach(u => console.log(`  - ${u.name} (${u.email}): ${u.id}`));
  
  // 获取所有配对
  const matches = await prisma.match.findMany({
    include: {
      user: { select: { name: true, email: true } },
      matchedUser: { select: { name: true, email: true } },
    },
  });
  
  console.log('\n所有配对:');
  matches.forEach(m => {
    console.log(`  - ${m.user.name} <-> ${m.matchedUser.name} (状态: ${m.status}, 总分: ${m.totalScore})`);
  });
}

checkMatches().finally(() => prisma.$disconnect());
