# ✅ 迁移完成指南

## 🎉 已完成的工作

### 1. 基础架构
- ✅ 安装所有必要依赖（Pusher, Vercel Blob, 认证库等）
- ✅ 创建共享工具（Prisma, Auth, Pusher）
- ✅ 复制 Prisma schema 到前端

### 2. API Routes 迁移
- ✅ 认证路由：`/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- ✅ 匹配路由：`/api/matches/discover`, `/api/matches/rate`, `/api/matches`
- ✅ 聊天路由：`/api/chat/[matchId]` (GET, POST)

### 3. Pusher 集成
- ✅ 服务器端 Pusher 配置
- ✅ 聊天消息通过 Pusher 发送

## 📋 还需要完成的工作

### 1. 继续迁移剩余路由
- [ ] `/api/users/*` - 用户相关路由
- [ ] `/api/qa/*` - 问答游戏路由
- [ ] `/api/photos/*` - 照片上传路由（需要集成云存储）
- [ ] `/api/ai-coach/*` - AI 教练路由

### 2. 集成云存储
- [ ] 安装并配置 Vercel Blob 或 Cloudinary
- [ ] 修改照片上传逻辑
- [ ] 更新照片 URL 处理

### 3. 更新前端代码
- [ ] 更新 API 调用路径（从 `http://localhost:5001/api` 改为 `/api`）
- [ ] 替换 Socket.IO 客户端为 Pusher 客户端
- [ ] 更新文件上传组件

### 4. 环境变量配置
- [ ] 在 Vercel 设置 Pusher 环境变量
- [ ] 设置数据库环境变量（如果使用外部数据库）
- [ ] 设置云存储环境变量

## 🚀 快速开始

### 步骤 1: 设置环境变量

在 `frontend/.env.local` 添加：

```env
# 数据库（如果使用外部数据库）
DATABASE_URL="your-database-url"

# JWT
JWT_SECRET="your-secret-key"

# Pusher
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="us2"

# 前端 Pusher（公开）
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"
```

### 步骤 2: 更新前端 API 调用

修改 `frontend/lib/api.ts`：

```typescript
// 从：
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// 改为：
const API_URL = '/api'; // 使用相对路径，Next.js 会自动处理
```

### 步骤 3: 替换 Socket.IO 为 Pusher

在聊天页面中：

```typescript
// 安装
import Pusher from 'pusher-js';

// 初始化
const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

// 订阅频道
const channel = pusher.subscribe(`match-${matchId}`);
channel.bind('new_message', (message: Message) => {
  setMessages(prev => [...prev, message]);
});
```

### 步骤 4: 测试

1. 运行 `npm run dev`（在 frontend 目录）
2. 测试注册/登录
3. 测试匹配功能
4. 测试聊天功能

## ⚠️ 注意事项

1. **数据库**：如果使用 SQLite，确保 `frontend/prisma/dev.db` 存在
2. **Pusher**：需要注册 Pusher 账号获取密钥
3. **云存储**：照片上传需要配置 Vercel Blob 或 Cloudinary
4. **环境变量**：所有环境变量都需要在 Vercel 中设置

## 📝 下一步

1. 继续迁移剩余路由
2. 集成云存储
3. 更新前端代码
4. 测试所有功能
5. 部署到 Vercel

## 🆘 如果遇到问题

1. 检查环境变量是否正确设置
2. 检查 Prisma schema 是否正确
3. 检查 API Routes 路径是否正确
4. 查看浏览器控制台和服务器日志

