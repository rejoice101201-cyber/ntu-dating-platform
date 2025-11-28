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
    bio: '喜歡旅行和攝影，尋找有趣的靈魂 🎨',
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
    bio: '健身愛好者，喜歡戶外運動，週末常去爬山 🏔️',
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
    bio: '電影迷，喜歡看各種類型的電影，也喜歡打遊戲 🎮',
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
    bio: '喜歡閱讀和寫作，偶爾會去咖啡廳坐一下午 📚',
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
    bio: '熱愛生活，喜歡嘗試新事物，尋找志同道合的朋友 ✨',
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
    bio: '工程師，喜歡程式設計和科技，也喜歡戶外活動 💻',
    tags: ['游戏', '运动', '阅读', '认真', '随和'],
  },
];

async function createBots() {
  console.log('🤖 開始建立機器人用戶...\n');

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
        console.log(`⏭️  用戶 ${bot.name} 已存在，更新資訊...`);
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
          console.log(`   為 ${bot.name} 新增了封面照片`);
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

      console.log(`✅ 建立用戶: ${bot.name} (${bot.email})`);
    } catch (error) {
      console.error(`❌ 建立用戶 ${bot.name} 失敗:`, error);
    }
  }

  console.log('\n🎉 機器人用戶建立完成！');
  console.log('\n📝 測試帳戶資訊:');
  console.log('   所有機器人的密碼都是: 123456');
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

