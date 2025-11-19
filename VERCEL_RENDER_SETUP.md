# 🔧 Vercel + Render 部署配置

## 📋 当前情况

- **Vercel（前端）**: 使用 `rejoice101201-cyber/ntu-dating-platform`
- **Render（后端）**: 需要部署，但看不到原仓库

## ✅ 解决方案：使用 Fork 的仓库部署后端

### 架构说明

```
原仓库 (rejoice101201-cyber/ntu-dating-platform)
├── Vercel 部署前端 ✅
└── 你无法在 Render 看到 ❌

Fork 仓库 (r12944069/ntu-dating-platform)
└── Render 部署后端 ✅
```

**这是完全可行的！** 因为：
- 前端和后端是独立的服务
- 只要后端 URL 正确，前端就能连接
- 两个仓库可以独立更新

---

## 🚀 部署步骤

### 步骤 1: Fork 仓库（如果还没 Fork）

1. 访问：https://github.com/rejoice101201-cyber/ntu-dating-platform
2. 点击 "Fork" 按钮
3. Fork 到 `r12944069` 账号

### 步骤 2: 在 Render 部署后端（使用 Fork 的仓库）

1. **登录 Render**
   - 访问 https://render.com
   - 使用 GitHub 登录（`r12944069` 账号）

2. **创建 Web Service**
   - 点击 "New +" → "Web Service"
   - 选择：`r12944069/ntu-dating-platform`（Fork 的仓库）
   - 点击 "Connect"

3. **配置服务**
   - **Name**: `ntu-dating-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`

4. **添加 PostgreSQL 数据库**
   - 在服务页面，点击 "Add Database"
   - 选择 "PostgreSQL"
   - 创建数据库

5. **设置环境变量**
   在服务的 "Environment" 标签页添加：
   ```
   DATABASE_URL=${{postgres.DATABASE_URL}}
   JWT_SECRET=your-super-secret-jwt-key-change-this
   PORT=5000
   FRONTEND_URL=https://ntu-dating-platform-kappa.vercel.app
   NODE_ENV=production
   ```

6. **部署**
   - 点击 "Create Web Service"
   - 等待部署完成

7. **运行数据库迁移**
   - 在服务页面，点击 "Shell" 或 "Terminal"
   - 运行：
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate deploy
   npm run db:seed
   npm run db:create-bots
   ```

8. **获取后端 URL**
   - 部署完成后，Render 会显示 URL
   - 格式类似：`https://ntu-dating-backend.onrender.com`
   - **这就是你的后端 URL！**

### 步骤 3: 在 Vercel 设置环境变量

1. **进入 Vercel 项目**
   - 项目：`ntu-dating-platform-kappa`
   - 使用原仓库：`rejoice101201-cyber/ntu-dating-platform`

2. **设置环境变量**
   - Settings → Environment Variables
   - 添加：
     - **Name**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://ntu-dating-backend.onrender.com/api`（你的 Render 后端 URL）
     - **Environment**: 选择所有环境（Production, Preview, Development）

3. **重新部署**
   - Deployments → 找到最新部署 → ⋯ → Redeploy
   - 或等待自动部署

---

## 🔄 代码同步（可选）

### 如果原仓库有更新

如果你在原仓库（`rejoice101201-cyber/ntu-dating-platform`）更新代码，需要同步到 Fork 的仓库：

#### 方法 1: 在 Fork 的仓库中 Pull 更新

```bash
# 在你的本地仓库
cd /Users/caimanxuan/ntu-dating-platform

# 添加原仓库为 upstream（如果还没添加）
git remote add upstream https://github.com/rejoice101201-cyber/ntu-dating-platform.git

# 拉取原仓库的更新
git fetch upstream

# 合并到你的本地
git merge upstream/main

# 推送到你的 Fork（触发 Render 自动部署）
git push origin main
```

#### 方法 2: 在 GitHub 网页上同步

1. 访问你的 Fork：`https://github.com/r12944069/ntu-dating-platform`
2. 点击 "Sync fork" 按钮
3. 点击 "Update branch"
4. Render 会自动检测并重新部署

---

## 📊 工作流程

### 日常开发

1. **更新代码**
   - 在原仓库（`rejoice101201-cyber/ntu-dating-platform`）push 代码
   - Vercel 自动部署前端 ✅

2. **同步后端代码**（如果需要）
   - 同步到 Fork 的仓库
   - Render 自动部署后端 ✅

### 前端更新
- 在原仓库 push → Vercel 自动部署

### 后端更新
- 在 Fork 的仓库 push → Render 自动部署
- 或同步原仓库的更新到 Fork

---

## ✅ 优势

1. **独立部署**
   - 前端和后端可以独立更新
   - 不影响对方

2. **权限清晰**
   - 你完全控制 Fork 的仓库
   - 可以正常部署后端

3. **自动部署**
   - Vercel 和 Render 都支持自动部署
   - 推送代码后自动更新

---

## 🔍 验证

### 检查前端（Vercel）

1. 访问：`https://ntu-dating-platform-kappa.vercel.app`
2. 打开浏览器控制台（F12）
3. 运行：
   ```javascript
   console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
   ```
4. 应该显示你的 Render 后端 URL

### 检查后端（Render）

1. 访问：`https://你的后端URL/api/health`
2. 应该看到：
   ```json
   {
     "status": "ok",
     "message": "Dating Platform API is running"
   }
   ```

### 测试登录

1. 在 Vercel 部署的网站尝试登录
2. 应该能正常登录，不会跳回登录页

---

## 📝 总结

**架构：**
- **前端（Vercel）**: `rejoice101201-cyber/ntu-dating-platform`
- **后端（Render）**: `r12944069/ntu-dating-platform`（Fork）

**关键点：**
- ✅ 两个仓库可以独立工作
- ✅ 只要后端 URL 正确，前端就能连接
- ✅ 需要时同步代码即可

**立即操作：**
1. Fork 仓库（如果还没 Fork）
2. 在 Render 部署后端（使用 Fork 的仓库）
3. 在 Vercel 设置 `NEXT_PUBLIC_API_URL` 环境变量
4. 完成！

---

## 🆘 如果遇到问题

### 问题 1: Render 部署失败

- 检查环境变量是否正确
- 检查数据库是否创建
- 查看部署日志

### 问题 2: 前端无法连接后端

- 检查 `NEXT_PUBLIC_API_URL` 是否正确
- 检查后端 CORS 设置
- 检查后端是否正常运行

### 问题 3: 代码不同步

- 使用上面的同步方法
- 或手动在 Fork 的仓库中更新代码

