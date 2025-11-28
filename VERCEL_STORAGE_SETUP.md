# 🗄️ 使用 Vercel Storage（Postgres）作为数据库

## 📋 步骤

### 1. 在 Vercel 创建 Postgres 数据库

1. **进入 Vercel Dashboard**
   - 访问 https://vercel.com/dashboard
   - 选择你的项目：`ntu-dating-platform-kappa`

2. **创建 Postgres 数据库**
   - 点击 **Storage** 标签
   - 点击 **Create Database**
   - 选择 **Postgres**
   - 输入名称（例如：`dating-platform-db`）
   - 选择区域（选择离你最近的，例如：`Washington, D.C. (us-east-1)`）
   - 点击 **Create**

3. **等待创建完成**
   - 大约需要 1-2 分钟
   - 创建完成后会显示数据库信息

### 2. 获取数据库连接 URL

1. **进入数据库设置**
   - 点击创建的 Postgres 数据库
   - 找到 **.env.local** 标签或 **Connection String**

2. **复制连接字符串**
   - 你会看到类似这样的 URL：
     ```
     postgres://default:xxxxx@xxxxx.vercel-storage.com:5432/verceldb
     ```
   - 或者会显示环境变量：
     ```
     POSTGRES_URL=postgres://default:xxxxx@xxxxx.vercel-storage.com:5432/verceldb
     POSTGRES_PRISMA_URL=postgres://default:xxxxx@xxxxx.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15
     POSTGRES_URL_NON_POOLING=postgres://default:xxxxx@xxxxx.vercel-storage.com:5432/verceldb
     ```

3. **使用 Prisma 连接字符串**
   - Vercel Postgres 推荐使用 `POSTGRES_PRISMA_URL`（带连接池）
   - 或者使用 `POSTGRES_URL_NON_POOLING`（不带连接池）

### 3. 在 Vercel 设置环境变量

1. **进入项目设置**
   - 项目 → **Settings** → **Environment Variables**

2. **添加数据库 URL**
   - 点击 **Add**
   - 变量名：`DATABASE_URL`
   - 变量值：从上面复制的 `POSTGRES_PRISMA_URL` 或 `POSTGRES_URL_NON_POOLING`
   - 选择环境：**All Environments**
   - 点击 **Save**

   **或者**，Vercel 可能会自动添加这些环境变量，检查一下是否已经存在。

### 4. 更新 Prisma Schema（如果需要）

检查 `frontend/prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

确保 `provider` 是 `"postgresql"`（不是 `"sqlite"`）。

### 5. 运行数据库迁移

#### 选项 A: 在本地运行（推荐）

1. **设置本地环境变量**
   - 在 `frontend/.env.local` 中添加：
     ```
     DATABASE_URL=你的Vercel Postgres URL
     ```

2. **运行迁移**
   ```bash
   cd frontend
   npx prisma migrate deploy
   ```

3. **运行种子数据**
   ```bash
   npx prisma db seed
   ```

#### 选项 B: 在 Vercel 部署后运行（通过 API）

创建一个临时的 API 路由来运行迁移（仅用于初始化）：

```typescript
// frontend/app/api/admin/migrate/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  // 添加安全验证（例如：检查管理员密钥）
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 这里可以运行一些初始化操作
    // 注意：Prisma migrate 通常需要在构建时运行
    return NextResponse.json({ message: 'Migration completed' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

**更好的方法**：使用 Vercel 的构建命令自动运行迁移。

### 6. 更新 Vercel 构建命令（自动运行迁移）

在 `frontend/package.json` 中添加：

```json
{
  "scripts": {
    "build": "prisma migrate deploy && prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

或者在 `vercel.json` 中设置：

```json
{
  "buildCommand": "cd frontend && npm install && npx prisma migrate deploy && npx prisma generate && npm run build"
}
```

### 7. 重新部署

1. **提交代码**
   ```bash
   git add .
   git commit -m "chore: 配置 Vercel Postgres"
   git push origin main
   ```

2. **Vercel 会自动部署**
   - 或者手动触发：Deployments → Redeploy

3. **检查构建日志**
   - 确认迁移成功运行
   - 确认没有数据库连接错误

## ✅ 验证

### 检查数据库连接

部署后，访问你的网站并尝试：
1. 注册一个新用户
2. 登录
3. 查看是否能正常保存数据

### 检查 Vercel 日志

- Vercel Dashboard → 项目 → **Logs**
- 查看是否有数据库连接错误

## 🔍 常见问题

### 问题 1: "relation does not exist"

**原因**：数据库表还没有创建。

**解决**：
1. 确保 `DATABASE_URL` 环境变量已设置
2. 运行 `npx prisma migrate deploy`（本地或通过构建命令）
3. 检查 Prisma schema 是否正确

### 问题 2: "connection timeout"

**原因**：Vercel Postgres 可能需要使用连接池。

**解决**：
- 使用 `POSTGRES_PRISMA_URL`（带 `pgbouncer=true`）
- 或者在 Prisma schema 中使用 `connection_limit` 和 `pool_timeout`

### 问题 3: "SSL required"

**原因**：Vercel Postgres 需要 SSL 连接。

**解决**：
- 在 `DATABASE_URL` 中添加 `?sslmode=require`
- 或者使用 Vercel 提供的完整连接字符串（通常已包含 SSL）

## 📝 环境变量总结

在 Vercel 中需要设置：

```
DATABASE_URL=postgres://default:xxxxx@xxxxx.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15
JWT_SECRET=你的随机密钥
```

可选（如果需要实时聊天和照片上传）：
```
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=us2
BLOB_READ_WRITE_TOKEN=...
```

## 🎯 快速检查清单

- [ ] 在 Vercel 创建了 Postgres 数据库
- [ ] 复制了 `POSTGRES_PRISMA_URL` 或 `POSTGRES_URL_NON_POOLING`
- [ ] 在 Vercel 环境变量中设置了 `DATABASE_URL`
- [ ] 确认 Prisma schema 使用 `provider = "postgresql"`
- [ ] 更新了构建命令以运行迁移（可选）
- [ ] 重新部署了项目
- [ ] 测试了注册/登录功能

完成这些步骤后，你的应用就可以使用 Vercel Postgres 作为数据库了！

