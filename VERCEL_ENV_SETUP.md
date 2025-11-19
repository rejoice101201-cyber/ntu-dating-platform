# 🔧 Vercel 环境变量设置指南

## 📋 你提供的数据库 URL

你提供了三个数据库连接字符串：

1. **PRISMA_DATABASE_URL** (标准 PostgreSQL)
2. **POSTGRES_URL** (标准 PostgreSQL)  
3. **PRISMA_DATABASE_URL** (Prisma Accelerate - 带 API key)

## 🎯 推荐配置

### 选项 A: 使用标准 PostgreSQL（推荐用于迁移）

如果你使用 **Prisma Migrate**，应该使用标准的 PostgreSQL URL。

### 选项 B: 使用 Prisma Accelerate（推荐用于生产）

如果你使用 **Prisma Accelerate**，可以获得更好的性能和连接池管理。

## 📝 在 Vercel 设置环境变量

### 步骤 1: 进入环境变量设置

1. Vercel Dashboard → 你的项目
2. **Settings** → **Environment Variables**

### 步骤 2: 添加必需的环境变量

#### 如果使用标准 PostgreSQL：

添加以下环境变量：

```
DATABASE_URL=postgres://96ed1a18d25dc4c7079a2ae1f9d303bf99fe55ce3f4aef2f80ed4b2bf436c06f:sk_6QZn0dO8h6CimMKblMCKO@db.prisma.io:5432/postgres?sslmode=require
```

**或者**使用 `POSTGRES_URL` 的值（如果不同）。

#### 如果使用 Prisma Accelerate：

需要设置两个环境变量：

1. **DATABASE_URL**（用于 Prisma Migrate）：
   ```
   DATABASE_URL=postgres://96ed1a18d25dc4c7079a2ae1f9d303bf99fe55ce3f4aef2f80ed4b2bf436c06f:sk_6QZn0dO8h6CimMKblMCKO@db.prisma.io:5432/postgres?sslmode=require
   ```

2. **PRISMA_DATABASE_URL**（用于 Prisma Client，通过 Accelerate）：
   ```
   PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza182UVpuMGRPOGg2Q2ltTUtibE1DS08iLCJhcGlfa2V5IjoiMDFLQUU4M0tRVjNGRlYxMzdWTldSWTRWRTciLCJ0ZW5hbnRfaWQiOiI5NmVkMWExOGQyNWRjNGM3MDc5YTJhZTFmOWQzMDNiZjk5ZmU1NWNlM2Y0YWVmMmY4MGVkNGIyYmY0MzZjMDZmIiwiaW50ZXJuYWxfc2VjcmV0IjoiYjhiNWM0ODEtYzQxNy00NDI4LWJmMDktM2EzMGIyODJlNmE3In0.IwdkG4UXZhKZF_cmyG02J3IGqAQqRlfntbKLb2ISWuQ
   ```

### 步骤 3: 添加 JWT 密钥

```
JWT_SECRET=你的随机密钥
```

**生成密钥**（在终端运行）：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤 4: 选择环境

- 选择 **All Environments**（Production, Preview, Development）
- 点击 **Save**

## 🔄 更新 Prisma Client 配置（如果使用 Accelerate）

如果你使用 Prisma Accelerate，需要更新 `frontend/lib/prisma.ts`：

```typescript
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL,
        },
      },
    }).$extends(withAccelerate());
  }
  prisma = (global as any).prisma;
}

export { prisma };
```

**注意**：使用 Accelerate 需要安装 `@prisma/extension-accelerate`：
```bash
npm install @prisma/extension-accelerate
```

## ✅ 推荐配置（最简单）

### 最小配置（不使用 Accelerate）：

在 Vercel 环境变量中设置：

```
DATABASE_URL=postgres://96ed1a18d25dc4c7079a2ae1f9d303bf99fe55ce3f4aef2f80ed4b2bf436c06f:sk_6QZn0dO8h6CimMKblMCKO@db.prisma.io:5432/postgres?sslmode=require
JWT_SECRET=你的随机密钥
```

这样就可以了！Prisma 会自动使用 `DATABASE_URL`。

## 🚀 部署后验证

1. **检查构建日志**
   - 确认 `prisma generate` 成功
   - 确认 `prisma migrate deploy` 成功

2. **测试功能**
   - 访问网站
   - 尝试注册新用户
   - 检查是否能正常保存数据

## 🔍 常见问题

### 问题 1: "relation does not exist"

**原因**：数据库表还没有创建。

**解决**：
1. 确保 `DATABASE_URL` 已设置
2. 在本地运行迁移：
   ```bash
   cd frontend
   export DATABASE_URL="你的数据库URL"
   npx prisma migrate deploy
   ```

### 问题 2: "SSL required"

你的 URL 已经包含 `?sslmode=require`，这应该没问题。

### 问题 3: 连接超时

如果使用 Accelerate，连接应该更快。如果使用标准 URL，可能需要添加连接池参数。

## 📋 环境变量清单

### 必需：

- [ ] `DATABASE_URL` = 你的 PostgreSQL URL
- [ ] `JWT_SECRET` = 随机生成的密钥

### 可选（如果使用 Accelerate）：

- [ ] `PRISMA_DATABASE_URL` = Prisma Accelerate URL

### 可选（功能会受限）：

- [ ] `PUSHER_*` = 实时聊天
- [ ] `BLOB_READ_WRITE_TOKEN` = 照片上传

## 🎯 快速设置步骤

1. **Vercel Dashboard** → 项目 → **Settings** → **Environment Variables**
2. **添加**：
   - `DATABASE_URL` = `postgres://96ed1a18d25dc4c7079a2ae1f9d303bf99fe55ce3f4aef2f80ed4b2bf436c06f:sk_6QZn0dO8h6CimMKblMCKO@db.prisma.io:5432/postgres?sslmode=require`
   - `JWT_SECRET` = 运行命令生成的密钥
3. **选择** All Environments
4. **保存**
5. **重新部署**（或等待自动部署）

完成！🎉
