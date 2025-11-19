# 🔍 如何找到后端 URL

## 情况说明

根据项目文档，后端需要部署到 **Railway** 或其他平台。如果你还没有部署后端，需要先部署。

## 📋 检查后端是否已部署

### 方法 1：检查是否有后端部署

1. **检查 Railway**
   - 访问 https://railway.app
   - 登录你的账号
   - 查看是否有名为 `ntu-dating-platform` 或类似的项目
   - 如果有，点击项目，查看服务 URL

2. **检查其他平台**
   - Render: https://render.com
   - Heroku: https://heroku.com
   - 或其他部署平台

### 方法 2：询问项目所有者

如果后端是项目所有者部署的：
- 询问他们后端 URL 是什么
- 或者让他们在 Vercel 环境变量中设置 `NEXT_PUBLIC_API_URL`

## 🚀 如果后端还没部署 - 部署步骤

### 选项 A：部署到 Railway（推荐）

1. **登录 Railway**
   - 访问 https://railway.app
   - 使用 GitHub 登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择 `rejoice101201-cyber/ntu-dating-platform` 仓库

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
   JWT_SECRET=your-super-secret-jwt-key-change-this
   PORT=5000
   FRONTEND_URL=https://ntu-dating-platform-kappa.vercel.app
   NODE_ENV=production
   ```

6. **运行数据库迁移**
   在 Railway 的 Terminal 中运行：
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run db:seed
   npm run db:create-bots
   ```

7. **获取后端 URL**
   - Railway 会自动分配一个 URL
   - 格式类似：`https://xxx.up.railway.app`
   - **这就是你的后端 URL！**

8. **在 Vercel 设置环境变量**
   - 进入 Vercel 项目
   - Settings → Environment Variables
   - 添加：
     - Name: `NEXT_PUBLIC_API_URL`
     - Value: `https://xxx.up.railway.app/api`（你的 Railway URL + `/api`）
     - Environment: 选择所有环境

### 选项 B：使用本地后端（仅用于测试）

如果只是测试，可以暂时使用本地后端：

1. **在本地运行后端**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **使用 ngrok 暴露本地服务**
   ```bash
   # 安装 ngrok
   npm i -g ngrok
   
   # 暴露本地 5001 端口
   ngrok http 5001
   ```

3. **获取 ngrok URL**
   - ngrok 会显示一个 URL，例如：`https://abc123.ngrok.io`
   - 这就是你的临时后端 URL

4. **在 Vercel 设置环境变量**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://abc123.ngrok.io/api`

⚠️ **注意**：ngrok 是临时方案，每次重启 URL 会变化，不适合生产环境。

## 🔍 如何确认后端 URL 是否正确

### 测试后端是否可访问

在浏览器中访问：
```
https://你的后端URL/api/health
```

如果看到：
```json
{
  "status": "ok",
  "message": "Dating Platform API is running"
}
```

说明后端正常运行！

### 测试 API 端点

在浏览器中访问：
```
https://你的后端URL/api/auth/me
```

如果返回 JSON 响应（即使是错误），说明后端可访问。

## 📝 后端 URL 格式

后端 URL 应该是：
- **完整 URL**：`https://xxx.up.railway.app`
- **API 端点**：`https://xxx.up.railway.app/api`

在 Vercel 环境变量中，应该设置为：
```
NEXT_PUBLIC_API_URL=https://xxx.up.railway.app/api
```

## ✅ 检查清单

- [ ] 后端已部署到 Railway 或其他平台
- [ ] 获取了后端 URL（例如：`https://xxx.up.railway.app`）
- [ ] 测试了后端健康检查端点（`/api/health`）
- [ ] 在 Vercel 设置了 `NEXT_PUBLIC_API_URL` 环境变量
- [ ] 环境变量值格式正确（包含 `/api` 后缀）
- [ ] 重新部署了 Vercel 项目

## 🆘 如果找不到后端 URL

1. **询问项目所有者**
   - 后端可能已经由项目所有者部署
   - 询问他们后端 URL 是什么

2. **检查项目文档**
   - 查看是否有部署记录
   - 检查是否有环境变量配置文档

3. **自己部署**
   - 按照上面的步骤部署到 Railway
   - 获取 URL 后设置到 Vercel

## 💡 提示

- Railway 的 URL 格式通常是：`https://项目名.up.railway.app`
- 如果使用自定义域名，URL 会不同
- 确保后端 URL 包含协议（`https://`）
- 确保 API 路径正确（`/api`）

