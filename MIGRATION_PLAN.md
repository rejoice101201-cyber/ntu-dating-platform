# 🔄 迁移到 Next.js API Routes + Pusher 架构

## 📋 迁移计划

### 阶段 1: 设置依赖和基础结构
- [x] 安装 Pusher 相关依赖
- [ ] 安装云存储依赖（Cloudinary 或 Vercel Blob）
- [ ] 创建 Next.js API Routes 目录结构

### 阶段 2: 迁移认证路由
- [ ] `/api/auth/register` → `frontend/app/api/auth/register/route.ts`
- [ ] `/api/auth/login` → `frontend/app/api/auth/login/route.ts`
- [ ] `/api/auth/me` → `frontend/app/api/auth/me/route.ts`

### 阶段 3: 迁移用户路由
- [ ] `/api/users/:id` → `frontend/app/api/users/[id]/route.ts`
- [ ] `/api/users/me` → `frontend/app/api/users/me/route.ts`
- [ ] `/api/users/me/photos` → `frontend/app/api/users/me/photos/route.ts`

### 阶段 4: 迁移匹配路由
- [ ] `/api/matches/discover` → `frontend/app/api/matches/discover/route.ts`
- [ ] `/api/matches/rate` → `frontend/app/api/matches/rate/route.ts`
- [ ] `/api/matches` → `frontend/app/api/matches/route.ts`

### 阶段 5: 迁移聊天路由
- [ ] `/api/chat/:matchId` → `frontend/app/api/chat/[matchId]/route.ts`
- [ ] 集成 Pusher 替代 Socket.IO

### 阶段 6: 迁移其他路由
- [ ] `/api/qa/*` → `frontend/app/api/qa/*/route.ts`
- [ ] `/api/photos/*` → `frontend/app/api/photos/*/route.ts`
- [ ] `/api/ai-coach/*` → `frontend/app/api/ai-coach/*/route.ts`

### 阶段 7: 更新前端代码
- [ ] 更新 API 调用路径
- [ ] 替换 Socket.IO 客户端为 Pusher
- [ ] 更新文件上传逻辑

### 阶段 8: 清理和测试
- [ ] 删除旧的 backend 目录（可选）
- [ ] 更新环境变量文档
- [ ] 测试所有功能

