# 设置指南

## 快速开始

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 设置数据库

#### 安装 PostgreSQL

- macOS: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`
- Windows: 从 [PostgreSQL 官网](https://www.postgresql.org/download/) 下载安装

#### 创建数据库

```bash
createdb dating_platform
```

### 3. 配置环境变量

#### 后端配置 (`backend/.env`)

```env
DATABASE_URL="postgresql://username:password@localhost:5432/dating_platform?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

#### 前端配置 (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. 初始化数据库

```bash
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. 启动开发服务器

在项目根目录运行：

```bash
npm run dev
```

这将同时启动：
- 前端: http://localhost:3000
- 后端: http://localhost:5000

## 项目结构

```
ntu-dating-platform/
├── frontend/              # Next.js 前端
│   ├── app/              # 页面和路由
│   ├── components/       # React 组件
│   ├── lib/              # 工具函数
│   └── store/            # 状态管理
├── backend/              # Express 后端
│   ├── src/
│   │   ├── routes/      # API 路由
│   │   ├── middleware/  # 中间件
│   │   ├── socket/      # WebSocket
│   │   └── scripts/     # 脚本
│   └── prisma/          # 数据库 schema
└── package.json         # 根配置
```

## 功能说明

### 已实现功能

✅ 用户注册/登录
✅ 个人资料管理
✅ 照片上传（自动模糊）
✅ 标签系统
✅ 探索/推荐系统
✅ 评分配对机制
✅ 问答游戏
✅ 照片解锁机制
✅ 实时聊天
✅ 体力系统
✅ AI 柴犬教练（基础版）

### 待完善功能

- [ ] 照片实际存储（目前是占位符）
- [ ] 更完善的推荐算法
- [ ] 照片审核系统
- [ ] 更丰富的 AI 柴犬功能
- [ ] 移动端优化

## 常见问题

### 数据库连接失败

确保 PostgreSQL 正在运行：
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### 端口被占用

修改 `backend/.env` 中的 `PORT` 或 `frontend/.env.local` 中的配置。

### 依赖安装失败

尝试删除 `node_modules` 和 `package-lock.json`，然后重新安装：
```bash
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
npm run install:all
```

## 开发建议

1. 使用 Prisma Studio 查看数据库：
   ```bash
   cd backend
   npm run db:studio
   ```

2. 查看 API 文档：访问 http://localhost:5000/api/health

3. 开发时建议使用 TypeScript 严格模式，确保类型安全。

