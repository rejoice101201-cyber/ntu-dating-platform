# 🔧 环境变量配置指南

## 📋 迁移到 Next.js API Routes 后的环境变量

迁移完成后，你需要在 Vercel 设置以下环境变量：

## ✅ 必需的环境变量

### 1. 数据库

```env
DATABASE_URL="your-database-url"
```

**选项：**
- **SQLite（本地开发）**: `file:./prisma/dev.db`
- **PostgreSQL（生产）**: `postgresql://user:password@host:5432/dbname`
- **Supabase**: `postgresql://...` (从 Supabase 项目设置获取)
- **PlanetScale**: `mysql://...` (从 PlanetScale 获取)

### 2. JWT 密钥

```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

**生成方法：**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Pusher（实时聊天）

```env
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="us2"
```

**获取方法：**
1. 访问 https://pusher.com
2. 注册/登录账号
3. 创建新应用
4. 复制 App ID, Key, Secret, Cluster

### 4. Pusher（前端，公开）

```env
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"
```

**注意：** 这些是公开的，会暴露在前端代码中。

### 5. Vercel Blob（照片存储，可选）

```env
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

**获取方法：**
1. 访问 Vercel Dashboard
2. Storage → Create Database → Blob
3. 复制 Read/Write Token

**或者使用 Cloudinary：**
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## 📝 在 Vercel 设置环境变量

### 步骤 1: 进入项目设置

1. 登录 Vercel
2. 进入项目：`ntu-dating-platform-kappa`
3. 点击 **Settings** → **Environment Variables**

### 步骤 2: 添加环境变量

点击 **Add**，然后添加每个变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `DATABASE_URL` | 你的数据库 URL | All |
| `JWT_SECRET` | 随机生成的密钥 | All |
| `PUSHER_APP_ID` | Pusher App ID | All |
| `PUSHER_KEY` | Pusher Key | All |
| `PUSHER_SECRET` | Pusher Secret | All |
| `PUSHER_CLUSTER` | Pusher Cluster | All |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher Key（同上） | All |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher Cluster（同上） | All |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Token | All |

### 步骤 3: 重新部署

设置完环境变量后：

1. 进入 **Deployments** 页面
2. 点击最新部署的 **⋯** → **Redeploy**
3. 或推送新的 commit 触发自动部署

## 🔍 从 Twitter 项目复制环境变量

如果你已经有 Twitter 项目，可以直接复制：

1. **进入 Twitter 项目的 Vercel 设置**
2. **复制以下环境变量**：
   - `DATABASE_URL` (或 `POSTGRES_URL`, `PRISMA_DATABASE_URL`)
   - `PUSHER_APP_ID`
   - `PUSHER_KEY`
   - `PUSHER_SECRET`
   - `PUSHER_CLUSTER`
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`

3. **在新项目中设置相同的值**

## ⚠️ 重要提示

1. **JWT_SECRET** 必须与 Twitter 项目不同（如果使用相同的数据库）
2. **PUSHER** 可以使用相同的应用（如果愿意）
3. **DATABASE_URL** 可以使用相同的数据库（如果愿意）
4. 所有环境变量都需要在 **所有环境**（Production, Preview, Development）中设置

## ✅ 验证

设置完成后，检查：

1. **数据库连接**：
   - 访问 `/api/health`（如果创建了健康检查端点）
   - 或尝试注册/登录

2. **Pusher 连接**：
   - 打开聊天页面
   - 检查浏览器控制台是否有 Pusher 连接错误

3. **照片上传**：
   - 尝试上传照片
   - 检查是否成功保存到 Vercel Blob

## 🆘 如果遇到问题

### 问题 1: 数据库连接失败

- 检查 `DATABASE_URL` 是否正确
- 检查数据库是否允许 Vercel IP 访问
- 检查数据库是否正在运行

### 问题 2: Pusher 连接失败

- 检查所有 Pusher 环境变量是否设置
- 检查 Pusher 应用是否激活
- 检查浏览器控制台错误信息

### 问题 3: 照片上传失败

- 检查 `BLOB_READ_WRITE_TOKEN` 是否设置
- 检查 Vercel Blob 存储是否创建
- 检查文件大小限制

