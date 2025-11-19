# 🚀 合作者部署指南

## 📋 情况说明

如果你是这个仓库的合作者（Collaborator），有两种部署方式：

## 方式一：直接使用原仓库部署（推荐）

### 前提条件
- 你的 GitHub 账号有该仓库的访问权限
- 你的新 Vercel 账号可以连接到 GitHub

### 部署步骤

#### 1. Vercel 部署前端

1. **登录新 Vercel 账号**
   - 访问 https://vercel.com
   - 使用 GitHub 登录

2. **授权 GitHub 访问**
   - Vercel 会要求授权访问 GitHub
   - 确保授权后能看到 `ntu-dating-platform` 仓库

3. **导入项目**
   - 点击 "Add New" → "Project"
   - 在仓库列表中找到 `ntu-dating-platform`
   - 如果看不到，检查：
     - GitHub 账号是否正确
     - 是否有仓库访问权限
     - 尝试刷新仓库列表

4. **配置项目**
   - Framework Preset: **Next.js**
   - Root Directory: **`frontend`** ⚠️ 重要！
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/.next`
   - Install Command: `cd frontend && npm install`

5. **设置环境变量**
   - 在项目设置 → Environment Variables
   - 添加：
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
     ```
   - ⚠️ 先部署后端获取 URL 后再设置

6. **部署**
   - 点击 "Deploy"
   - 等待部署完成

#### 2. Railway 部署后端

1. **登录 Railway**
   - 访问 https://railway.app
   - 使用 GitHub 登录

2. **创建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择 `ntu-dating-platform` 仓库

3. **添加服务**
   - 添加 **PostgreSQL** 数据库
   - 添加 **Node.js** 服务

4. **配置 Node.js 服务**
   - 在服务设置中：
     - **Root Directory**: `backend`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

5. **设置环境变量**
   在 Node.js 服务的 Variables 标签页添加：
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   FRONTEND_URL=https://your-vercel-app.vercel.app
   NODE_ENV=production
   ```

6. **运行数据库迁移**
   - 在 Railway 的 Node.js 服务中，点击 "Deploy Logs" 或 "Terminal"
   - 运行以下命令：
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run db:seed
   npm run db:create-bots
   ```

7. **获取后端 URL**
   - Railway 会自动分配一个 URL
   - 格式类似：`https://xxx.up.railway.app`
   - 复制这个 URL

8. **更新 Vercel 环境变量**
   - 回到 Vercel 项目设置
   - 更新 `NEXT_PUBLIC_API_URL` 为：`https://xxx.up.railway.app/api`
   - 重新部署前端

## 方式二：Fork 仓库到自己的账号

如果无法直接访问原仓库，可以 Fork 到自己的账号：

### 1. Fork 仓库

1. 访问原仓库的 GitHub 页面
2. 点击右上角 "Fork" 按钮
3. 选择 Fork 到自己的账号

### 2. 克隆 Fork 的仓库

```bash
git clone https://github.com/your-username/ntu-dating-platform.git
cd ntu-dating-platform
```

### 3. 添加原仓库为 upstream（可选）

```bash
git remote add upstream https://github.com/original-owner/ntu-dating-platform.git
```

### 4. 按照方式一的步骤部署

使用你 Fork 的仓库进行部署。

## 🔧 部署后配置

### 更新 CORS 设置

在 Railway 的后端环境变量中，确保 `FRONTEND_URL` 设置为你的 Vercel 域名：
```
FRONTEND_URL=https://your-app.vercel.app
```

### 检查后端 CORS 配置

确保 `backend/src/index.ts` 中的 CORS 配置允许你的 Vercel 域名：

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-app.vercel.app',
  credentials: true,
  // ...
}));
```

## 📝 环境变量检查清单

### Vercel（前端）
- ✅ `NEXT_PUBLIC_API_URL` = `https://your-backend.railway.app/api`

### Railway（后端）
- ✅ `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`（Railway 自动提供）
- ✅ `JWT_SECRET` = 随机生成的密钥
- ✅ `PORT` = `5000`
- ✅ `FRONTEND_URL` = `https://your-vercel-app.vercel.app`
- ✅ `NODE_ENV` = `production`

## ⚠️ 注意事项

1. **权限问题**
   - 如果 Vercel 看不到仓库，检查 GitHub 权限设置
   - 可能需要仓库所有者重新邀请你

2. **代码更新**
   - 作为合作者，你可以正常 push 代码
   - Vercel 会自动检测并部署新代码

3. **环境变量安全**
   - 不要将 `.env` 文件提交到 Git
   - 所有敏感信息都在 Vercel/Railway 的环境变量中设置

4. **数据库迁移**
   - 每次部署后可能需要运行迁移
   - 可以在 Railway 的部署脚本中自动化

## 🐛 常见问题

### Q: Vercel 看不到仓库？
A: 
1. 检查 GitHub 账号是否正确
2. 确认你有仓库的访问权限
3. 尝试在 Vercel 中重新连接 GitHub

### Q: 部署后 API 请求失败？
A:
1. 检查 `NEXT_PUBLIC_API_URL` 是否正确
2. 检查后端 CORS 配置
3. 检查后端是否正常运行

### Q: Socket.IO 连接失败？
A:
1. 检查 Railway 是否支持 WebSocket
2. 检查后端 Socket.IO 配置
3. 可能需要使用 Railway 的 WebSocket 支持

## 📚 相关链接

- [Vercel 文档](https://vercel.com/docs)
- [Railway 文档](https://docs.railway.app)
- [GitHub 合作者权限](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-user-account/managing-access-to-your-personal-repositories/inviting-collaborators-to-a-personal-repository)

