# 🚀 Vercel 部署指南

## 📋 部署前准备

### 1. 后端部署（需要单独部署）

Vercel 主要支持前端部署，后端需要部署到其他平台。推荐选项：

#### 选项 A: Railway（推荐）
- 网址：https://railway.app
- 支持 Node.js + PostgreSQL
- 免费额度充足

#### 选项 B: Render
- 网址：https://render.com
- 支持 Node.js + PostgreSQL
- 免费额度有限

#### 选项 C: Vercel Serverless Functions（仅适合简单 API）
- 需要将后端代码转换为 Serverless Functions
- 不适合 Socket.IO 实时通信

### 2. 数据库设置

如果使用 Railway 或 Render：
- 创建 PostgreSQL 数据库
- 获取数据库连接字符串

## 🎯 Vercel 前端部署步骤

### 方法一：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New" → "Project"
   - 选择你的 GitHub 仓库 `ntu-dating-platform`
   - 点击 "Import"

3. **配置项目设置**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`（或 `cd frontend && npm run build`）
   - **Output Directory**: `.next`（Next.js 默认）
   - **Install Command**: `npm install`（或 `cd frontend && npm install`）

4. **设置环境变量**
   在 Vercel 项目设置中添加：
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   ```
   ⚠️ 将 `your-backend-url.com` 替换为你的实际后端 URL

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成

### 方法二：通过 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **在项目根目录部署**
   ```bash
   cd /Users/caimanxuan/ntu-dating-platform
   vercel
   ```

4. **按提示操作**
   - 选择项目范围
   - 选择项目名称
   - 确认设置

5. **设置环境变量**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # 输入你的后端 API URL，例如：https://your-backend.railway.app/api
   ```

6. **重新部署**
   ```bash
   vercel --prod
   ```

## 🔧 后端部署到 Railway（推荐）

### 1. 创建 Railway 账号
- 访问 https://railway.app
- 使用 GitHub 登录

### 2. 创建新项目
- 点击 "New Project"
- 选择 "Deploy from GitHub repo"
- 选择你的仓库

### 3. 添加服务
- 添加 **PostgreSQL** 数据库
- 添加 **Node.js** 服务（选择 `backend` 目录）

### 4. 配置环境变量
在 Railway 的 Node.js 服务中添加：
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
FRONTEND_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

### 5. 设置构建命令
在 Railway 的 Node.js 服务设置中：
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 6. 运行数据库迁移
在 Railway 的 Node.js 服务中，打开 Terminal 运行：
```bash
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

### 7. 获取后端 URL
- Railway 会自动分配一个 URL，例如：`https://your-app.railway.app`
- 将这个 URL 添加到 Vercel 的 `NEXT_PUBLIC_API_URL` 环境变量

## 📝 环境变量清单

### Vercel（前端）环境变量
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### Railway（后端）环境变量
```
DATABASE_URL=postgresql://...（Railway 自动提供）
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
FRONTEND_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

## 🔄 更新部署

### 前端更新
```bash
git push origin main
# Vercel 会自动检测并部署
```

### 后端更新
```bash
git push origin main
# Railway 会自动检测并部署
```

## ⚠️ 注意事项

1. **Socket.IO 实时通信**
   - 如果使用 Railway，确保 WebSocket 连接正常
   - 可能需要配置 CORS 和 WebSocket 支持

2. **文件上传**
   - 当前使用本地文件系统存储图片
   - 生产环境建议使用云存储（AWS S3, Cloudinary 等）

3. **数据库迁移**
   - 每次部署后需要运行 `prisma migrate deploy`
   - 可以在 Railway 的部署脚本中自动执行

4. **环境变量同步**
   - 确保前后端环境变量正确配置
   - 特别是 API URL 和 CORS 设置

## 🐛 常见问题

### 问题 1: API 请求失败
- 检查 `NEXT_PUBLIC_API_URL` 是否正确
- 检查后端 CORS 配置是否允许前端域名

### 问题 2: Socket.IO 连接失败
- 检查后端 WebSocket 配置
- 确保 Railway 支持 WebSocket

### 问题 3: 图片无法显示
- 检查图片 URL 是否正确
- 考虑使用云存储服务

## 📚 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [Railway 文档](https://docs.railway.app)
- [Next.js 部署](https://nextjs.org/docs/deployment)

