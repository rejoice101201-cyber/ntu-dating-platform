import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create tags
  const tags = [
    // Interests
    { name: '旅行', category: 'interest' },
    { name: '阅读', category: 'interest' },
    { name: '电影', category: 'interest' },
    { name: '音乐', category: 'interest' },
    { name: '运动', category: 'interest' },
    { name: '美食', category: 'interest' },
    { name: '摄影', category: 'interest' },
    { name: '游戏', category: 'interest' },
    
    // Personality
    { name: '开朗', category: 'personality' },
    { name: '内向', category: 'personality' },
    { name: '幽默', category: 'personality' },
    { name: '认真', category: 'personality' },
    { name: '随和', category: 'personality' },
    
    // Lifestyle
    { name: '早睡早起', category: 'lifestyle' },
    { name: '夜猫子', category: 'lifestyle' },
    { name: '素食', category: 'lifestyle' },
    { name: '健身', category: 'lifestyle' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      create: tag,
      update: tag,
    });
  }

  // Create questions
  const questions = [
    {
      content: '你更喜欢哪种周末活动？',
      category: 'lifestyle',
      type: 'multiple_choice',
      options: JSON.stringify(['宅在家里', '户外活动', '和朋友聚会', '独自探索']),
    },
    {
      content: '你最喜欢的电影类型是？',
      category: 'interest',
      type: 'multiple_choice',
      options: JSON.stringify(['动作片', '爱情片', '科幻片', '恐怖片', '喜剧片']),
    },
    {
      content: '你更喜欢旅行还是宅在家？',
      category: 'lifestyle',
      type: 'multiple_choice',
      options: JSON.stringify(['旅行', '宅在家', '都可以']),
    },
    {
      content: '你最喜欢的音乐类型是？',
      category: 'interest',
      type: 'multiple_choice',
      options: JSON.stringify(['流行', '摇滚', '古典', '爵士', '电子']),
    },
    {
      content: '你更喜欢早睡早起还是夜猫子？',
      category: 'lifestyle',
      type: 'multiple_choice',
      options: JSON.stringify(['早睡早起', '夜猫子', '看情况']),
    },
  ];

  for (const question of questions) {
    await prisma.question.create({
      data: question,
    });
  }

  console.log('✅ 種子資料建立成功！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

