# ntu-dating-platform
You can freely use this dating platform, it is a cute,functional,high quality and easy to use web service app,which you can definitely  make new friends(or girl/boy  friends)by using it!

## 🐕 NTU Dating Platform

一个注重内在的交友平台，通过互动解锁照片，找到真正适合的人。

### ✨ 核心功能

1. **照片模糊机制** - 照片初始为模糊状态，需要通过互动解锁
2. **文字/标签自我介绍** - 丰富的标签系统展示个性
3. **AI 柴犬教练** - 智能聊天机器人帮助破冰
4. **评分配对机制** - 双方评分达标才能配对
5. **体力系统** - 免费体力机制，鼓励认真互动
6. **问答游戏** - 通过问答游戏解锁照片和提升匹配度
7. **实时聊天** - 配对后可以实时聊天

### 🚀 快速开始

#### 前置要求

- Node.js 18+
- PostgreSQL 数据库
- npm 或 yarn

#### 安装步骤

1. **安装所有依赖**
```bash
npm run install:all
```

2. **配置数据库**

创建 `.env` 文件在 `backend/` 目录：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dating_platform?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

3. **初始化数据库**

```bash
cd backend
npm run db:generate
npm run db:migrate
```

4. **启动开发服务器**

```bash
# 在项目根目录
npm run dev
```

这将同时启动：
- 前端: http://localhost:3000
- 后端: http://localhost:5000

### 📁 项目结构

```
ntu-dating-platform/
├── frontend/          # Next.js 前端应用
│   ├── app/          # Next.js App Router
│   ├── components/   # React 组件
│   ├── lib/          # 工具函数
│   └── store/        # Zustand 状态管理
├── backend/          # Node.js + Express 后端
│   ├── src/
│   │   ├── routes/   # API 路由
│   │   ├── middleware/ # 中间件
│   │   └── socket/   # WebSocket 实时通信
│   └── prisma/       # 数据库 schema
└── package.json      # 根 package.json
```

### 🛠️ 技术栈

**前端:**
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Zustand (状态管理)
- Socket.io Client (实时聊天)

**后端:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Socket.io (WebSocket)
- Sharp (图片处理)
- JWT (身份验证)

### 📝 API 文档

#### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户

#### 用户
- `GET /api/users/:id` - 获取用户资料
- `PUT /api/users/me` - 更新个人资料
- `POST /api/users/me/photos` - 上传照片
- `GET /api/users/me/energy` - 获取体力值

#### 匹配
- `GET /api/matches/discover` - 获取推荐用户
- `POST /api/matches/rate` - 评分用户
- `GET /api/matches` - 获取已匹配列表

#### 聊天
- `GET /api/chat/:matchId` - 获取聊天记录

#### 问答
- `GET /api/qa/questions` - 获取问题列表
- `POST /api/qa/answer` - 提交答案
- `POST /api/qa/play/:targetUserId` - 与用户玩问答游戏

### 🎮 使用流程

1. **注册/登录** - 创建账户并填写基本信息
2. **完善资料** - 上传照片（会自动模糊）、添加标签、写自我介绍
3. **探索** - 浏览推荐用户，查看模糊照片和标签
4. **评分** - 给感兴趣的用户评分（1-5分）
5. **互动解锁** - 通过问答游戏解锁对方照片
6. **配对** - 双方评分总和达到7分以上即可配对
7. **聊天** - 配对后可以开始聊天，AI 柴犬会帮助破冰

### 🔒 安全特性

- JWT 身份验证
- 密码加密存储 (bcrypt)
- 用户资料验证
- 照片审核机制（可扩展）

### 📱 功能特性

- ✅ 照片模糊与解锁机制
- ✅ 标签系统
- ✅ 评分配对
- ✅ 问答游戏
- ✅ 实时聊天
- ✅ 体力系统（免费）
- ⏳ AI 柴犬教练（待实现）
- ⏳ 推荐算法优化（待实现）

### 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 📄 许可证

MIT License
