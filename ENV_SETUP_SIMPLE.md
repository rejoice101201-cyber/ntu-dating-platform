# 🔧 环境变量设置指南（简化版）

## 📋 必需的环境变量（最少配置）

### 1. 数据库 - DATABASE_URL

#### 选项 A: 使用 Supabase（推荐，免费）

1. **注册 Supabase**
   - 访问 https://supabase.com
   - 点击 "Start your project"
   - 使用 GitHub 登录

2. **创建新项目**
   - 点击 "New Project"
   - 输入项目名称（例如：`ntu-dating-platform`）
   - 设置数据库密码（记住这个密码！）
   - 选择区域（选择离你最近的）
   - 点击 "Create new project"

3. **获取数据库 URL**
   - 等待项目创建完成（约 2 分钟）
   - 进入项目 → **Settings** → **Database**
   - 找到 **Connection string** → **URI**
   - 复制这个 URL（格式：`postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`）
   - **这就是你的 DATABASE_URL！**

4. **在 Vercel 设置**
   ```
   DATABASE_URL=postgresql://postgres:你的密码@db.xxx.supabase.co:5432/postgres
   ```

#### 选项 B: 使用 SQLite（仅本地开发，生产环境不推荐）

```
DATABASE_URL=file:./prisma/dev.db
```

⚠️ **注意**：SQLite 不适合生产环境，建议使用 Supabase。

---

### 2. JWT 密钥 - JWT_SECRET

**生成随机密钥：**

在终端运行：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制输出的字符串，在 Vercel 设置：
```
JWT_SECRET=你刚才复制的字符串
```

---

### 3. Pusher（实时聊天）- 如果暂时不需要可以跳过

如果暂时不需要实时聊天功能，可以：
- 先不设置 Pusher 环境变量
- 聊天功能会无法使用，但其他功能正常

**如果需要实时聊天，获取 Pusher：**

1. **注册 Pusher**
   - 访问 https://pusher.com
   - 点击 "Sign up" 或 "Get started for free"
   - 使用 GitHub 或邮箱注册

2. **创建新应用**
   - 登录后，点击 "Create app" 或 "Channels app"
   - 输入应用名称（例如：`ntu-dating-platform`）
   - 选择 Cluster（选择 `us2` 或离你最近的）
   - 点击 "Create app"

3. **获取密钥**
   - 进入应用页面
   - 找到 **App Keys** 部分
   - 复制以下信息：
     - **App ID**
     - **Key**
     - **Secret**
     - **Cluster**（例如：`us2`）

4. **在 Vercel 设置**
   ```
   PUSHER_APP_ID=你的App ID
   PUSHER_KEY=你的Key
   PUSHER_SECRET=你的Secret
   PUSHER_CLUSTER=us2
   NEXT_PUBLIC_PUSHER_KEY=你的Key（与上面相同）
   NEXT_PUBLIC_PUSHER_CLUSTER=us2（与上面相同）
   ```

---

### 4. Vercel Blob（照片存储）- 如果暂时不需要可以跳过

如果暂时不需要照片上传功能，可以：
- 先不设置 BLOB_READ_WRITE_TOKEN
- 照片上传会失败，但其他功能正常

**如果需要照片上传，获取 Vercel Blob：**

1. **在 Vercel 创建 Blob 存储**
   - 进入 Vercel Dashboard
   - 点击 **Storage** 标签
   - 点击 **Create Database**
   - 选择 **Blob**
   - 输入名称（例如：`dating-platform-photos`）
   - 点击 **Create**

2. **获取 Token**
   - 进入创建的 Blob 存储
   - 找到 **Settings** 或 **Tokens**
   - 复制 **Read/Write Token**

3. **在 Vercel 设置**
   ```
   BLOB_READ_WRITE_TOKEN=你复制的Token
   ```

---

## 🎯 最小配置（只测试基本功能）

如果只想先测试注册/登录和基本功能：

### 必需的环境变量：

```
DATABASE_URL=你的Supabase数据库URL
JWT_SECRET=随机生成的密钥
```

### 可选的环境变量（功能会受限）：

```
# 实时聊天（不设置则聊天功能无法使用）
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# 照片上传（不设置则照片上传功能无法使用）
BLOB_READ_WRITE_TOKEN=...
```

---

## 📝 在 Vercel 设置环境变量

### 步骤：

1. **进入 Vercel 项目**
   - 项目：`ntu-dating-platform-kappa`
   - Settings → **Environment Variables**

2. **添加环境变量**
   - 点击 **Add**
   - 输入变量名和值
   - 选择环境：**All Environments**（Production, Preview, Development）
   - 点击 **Save**

3. **必需变量列表**

   | 变量名 | 值 | 如何获取 |
   |--------|-----|----------|
   | `DATABASE_URL` | Supabase 数据库 URL | 见上面步骤 |
   | `JWT_SECRET` | 随机字符串 | 运行命令生成 |

4. **可选变量（功能会受限）**

   | 变量名 | 值 | 如何获取 |
   |--------|-----|----------|
   | `PUSHER_APP_ID` | Pusher App ID | 见上面步骤 |
   | `PUSHER_KEY` | Pusher Key | 见上面步骤 |
   | `PUSHER_SECRET` | Pusher Secret | 见上面步骤 |
   | `PUSHER_CLUSTER` | `us2` | 见上面步骤 |
   | `NEXT_PUBLIC_PUSHER_KEY` | Pusher Key（同上） | 见上面步骤 |
   | `NEXT_PUBLIC_PUSHER_CLUSTER` | `us2`（同上） | 见上面步骤 |
   | `BLOB_READ_WRITE_TOKEN` | Vercel Blob Token | 见上面步骤 |

---

## 🚀 快速开始（最小配置）

### 步骤 1: 获取数据库 URL（Supabase）

1. 访问 https://supabase.com
2. 注册并创建项目
3. 复制数据库 URL

### 步骤 2: 生成 JWT 密钥

在终端运行：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤 3: 在 Vercel 设置

1. Vercel → Settings → Environment Variables
2. 添加：
   - `DATABASE_URL` = 你的 Supabase URL
   - `JWT_SECRET` = 你生成的密钥
3. 保存

### 步骤 4: 重新部署

- Deployments → Redeploy

### 步骤 5: 初始化数据库

部署后，需要在 Supabase 中运行数据库迁移：

1. **在本地运行迁移**（推荐）：
   ```bash
   cd frontend
   npx prisma migrate deploy
   npx prisma db seed
   ```

2. **或者使用 Supabase SQL Editor**：
   - 进入 Supabase → SQL Editor
   - 运行迁移 SQL（从 `frontend/prisma/migrations/.../migration.sql` 复制）

---

## ✅ 功能状态

### 设置最小配置后：

- ✅ 注册/登录 - 可以工作
- ✅ 个人资料 - 可以工作
- ✅ 探索用户 - 可以工作
- ✅ 评分功能 - 可以工作
- ✅ 问答游戏 - 可以工作
- ❌ 实时聊天 - 需要 Pusher（不设置则无法使用）
- ❌ 照片上传 - 需要 Vercel Blob（不设置则无法使用）

### 后续添加功能：

1. **需要实时聊天时**：添加 Pusher 环境变量
2. **需要照片上传时**：添加 Vercel Blob 环境变量

---

## 💡 建议

1. **先设置最小配置**（数据库 + JWT）
2. **测试基本功能**（注册、登录、探索）
3. **需要时再添加** Pusher 和 Vercel Blob

这样你可以先看到网站运行起来，然后再逐步添加功能！

