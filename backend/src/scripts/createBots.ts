import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const bots = [
  {
    email: 'alice@example.com',
    password: '123456',
    name: 'Alice',
    birthday: new Date('1998-05-15'),
    gender: 'female',
    location: '台北',
    height: 165,
    bio: '喜欢旅行和摄影，寻找有趣的灵魂 🎨',
    tags: ['旅行', '摄影', '阅读', '开朗', '早睡早起'],
  },
  {
    email: 'bob@example.com',
    password: '123456',
    name: 'Bob',
    birthday: new Date('1996-08-20'),
    gender: 'male',
    location: '新竹',
    height: 178,
    bio: '健身爱好者，喜欢户外运动，周末常去爬山 🏔️',
    tags: ['运动', '健身', '美食', '开朗', '认真'],
  },
  {
    email: 'charlie@example.com',
    password: '123456',
    name: 'Charlie',
    birthday: new Date('1999-03-10'),
    gender: 'male',
    location: '台中',
    height: 175,
    bio: '电影迷，喜欢看各种类型的电影，也喜欢打游戏 🎮',
    tags: ['电影', '游戏', '音乐', '随和', '夜猫子'],
  },
  {
    email: 'diana@example.com',
    password: '123456',
    name: 'Diana',
    birthday: new Date('1997-11-25'),
    gender: 'female',
    location: '高雄',
    height: 160,
    bio: '喜欢阅读和写作，偶尔会去咖啡厅坐一下午 📚',
    tags: ['阅读', '音乐', '美食', '内向', '早睡早起'],
  },
  {
    email: 'eve@example.com',
    password: '123456',
    name: 'Eve',
    birthday: new Date('2000-01-30'),
    gender: 'female',
    location: '台北',
    height: 162,
    bio: '热爱生活，喜欢尝试新事物，寻找志同道合的朋友 ✨',
    tags: ['旅行', '美食', '电影', '开朗', '幽默'],
  },
  {
    email: 'frank@example.com',
    password: '123456',
    name: 'Frank',
    birthday: new Date('1995-07-12'),
    gender: 'male',
    location: '桃园',
    height: 180,
    bio: '工程师，喜欢编程和科技，也喜欢户外活动 💻',
    tags: ['游戏', '运动', '阅读', '认真', '随和'],
  },
];

async function createBots() {
  console.log('🤖 开始创建机器人用户...\n');

  // 获取所有标签
  const allTags = await prisma.tag.findMany();
  const tagMap = new Map(allTags.map(tag => [tag.name, tag.id]));

  for (const bot of bots) {
    try {
      // 检查用户是否已存在
      const existing = await prisma.user.findUnique({
        where: { email: bot.email },
      });

      if (existing) {
        console.log(`⏭️  用户 ${bot.name} 已存在，更新信息...`);
        // 更新现有用户信息
        const user = await prisma.user.update({
          where: { id: existing.id },
          data: {
            isVerified: true,
            isActive: true,
            bio: bot.bio,
            location: bot.location,
            height: bot.height,
          },
        });
        
        // 检查并添加标签
        for (const tagName of bot.tags) {
          const tagId = tagMap.get(tagName);
          if (tagId) {
            const existingTag = await prisma.userTag.findUnique({
              where: {
                userId_tagId: {
                  userId: user.id,
                  tagId: tagId,
                },
              },
            });
            if (!existingTag) {
              await prisma.userTag.create({
                data: {
                  userId: user.id,
                  tagId: tagId,
                },
              });
            }
          }
        }

        // 检查是否有封面照片
        const coverPhoto = await prisma.photo.findFirst({
          where: {
            userId: user.id,
            isCover: true,
          },
        });

        if (!coverPhoto) {
          // 创建占位符照片
          await prisma.photo.create({
            data: {
              userId: user.id,
              url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${bot.name}`,
              blurLevel: 100,
              isCover: true,
              order: 0,
            },
          });
          console.log(`   为 ${bot.name} 添加了封面照片`);
        }
        continue;
      }

      // 创建用户
      const hashedPassword = await bcrypt.hash(bot.password, 10);
      const user = await prisma.user.create({
        data: {
          email: bot.email,
          password: hashedPassword,
          name: bot.name,
          birthday: bot.birthday,
          gender: bot.gender,
          location: bot.location,
          height: bot.height,
          bio: bot.bio,
          isVerified: true,
          isActive: true,
        },
      });

      // 添加标签
      for (const tagName of bot.tags) {
        const tagId = tagMap.get(tagName);
        if (tagId) {
          await prisma.userTag.create({
            data: {
              userId: user.id,
              tagId: tagId,
            },
          });
        }
      }

      // 添加封面照片（使用占位符）
      await prisma.photo.create({
        data: {
          userId: user.id,
          url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${bot.name}`,
          blurLevel: 100,
          isCover: true,
          order: 0,
        },
      });

      // 添加一些问答答案
      const questions = await prisma.question.findMany({ take: 3 });
      for (const question of questions) {
        let answer = '';
        if (question.type === 'multiple_choice' && question.options) {
          const options = JSON.parse(question.options);
          answer = options[Math.floor(Math.random() * options.length)];
        } else {
          answer = '是的';
        }

        try {
          await prisma.qAAnswer.create({
            data: {
              userId: user.id,
              questionId: question.id,
              answer: answer,
            },
          });
        } catch (err) {
          // 如果答案已存在，跳过
        }
      }

      console.log(`✅ 创建用户: ${bot.name} (${bot.email})`);
    } catch (error) {
      console.error(`❌ 创建用户 ${bot.name} 失败:`, error);
    }
  }

  console.log('\n🎉 机器人用户创建完成！');
  console.log('\n📝 测试账户信息:');
  console.log('   所有机器人的密码都是: 123456');
  bots.forEach(bot => {
    console.log(`   - ${bot.name}: ${bot.email}`);
  });
}

createBots()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

