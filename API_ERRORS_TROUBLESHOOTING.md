# API 错误排查指南

## 当前错误

1. **405 错误（方法不允许）**：
   - `/api/auth/login`
   - `/api/auth/register`
   - `/api/users/me/photos`

2. **500 错误（服务器错误）**：
   - `/api/matches/discover`
   - `/api/matches`
   - `/api/users/[id]`

## 可能的原因

### 405 错误

1. **路由没有正确导出**
   - 检查 `route.ts` 文件是否正确导出 `POST` 或 `GET` 函数
   - 确保文件在正确的目录结构中

2. **Next.js 路由缓存问题**
   - Vercel 可能需要重新构建
   - 清除 `.next` 缓存

3. **环境变量问题**
   - 检查 Vercel 环境变量是否已设置
   - `DATABASE_URL` 必须设置
   - `JWT_SECRET` 必须设置

### 500 错误

1. **数据库连接问题**
   - 检查 `DATABASE_URL` 是否正确
   - 检查数据库是否可访问
   - 检查 Prisma schema 是否已同步

2. **Prisma 客户端问题**
   - 确保 `prisma generate` 已运行
   - 检查 Prisma Client 是否正确生成

3. **认证问题**
   - 检查 JWT token 是否正确
   - 检查 `requireAuth` 函数是否正常工作

## 排查步骤

### 1. 检查 Vercel 日志

1. 进入 Vercel Dashboard
2. 选择项目
3. 点击 **Logs** 标签
4. 查看最新的错误日志
5. 查找具体的错误信息

### 2. 检查环境变量

在 Vercel Dashboard → Settings → Environment Variables 中确认：

- [ ] `DATABASE_URL` 已设置
- [ ] `JWT_SECRET` 已设置
- [ ] `PUSHER_*` 变量（如果使用实时聊天）
- [ ] `BLOB_READ_WRITE_TOKEN`（如果使用照片上传）

### 3. 检查数据库连接

在 Vercel 函数日志中查找：
- "DATABASE_URL is not set!" - 表示环境变量未设置
- Prisma 连接错误 - 表示数据库 URL 不正确或数据库不可访问

### 4. 测试 API 路由

使用 curl 或 Postman 测试：

```bash
# 测试注册
curl -X POST https://your-domain.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "name": "Test User",
    "birthday": "2000-01-01",
    "gender": "male"
  }'

# 测试登录
curl -X POST https://your-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

## 常见解决方案

### 解决方案 1: 重新部署

1. 在 Vercel Dashboard 中
2. 找到最新的部署
3. 点击 **Redeploy**

### 解决方案 2: 检查路由文件

确保所有 API 路由文件：
- 位于 `app/api/.../route.ts`
- 正确导出 `POST` 或 `GET` 函数
- 使用 `NextRequest` 和 `NextResponse`

### 解决方案 3: 检查数据库

1. 确认数据库 URL 正确
2. 运行 `prisma db push` 同步 schema
3. 检查数据库连接是否正常

### 解决方案 4: 清除缓存

如果问题持续，尝试：
1. 在 Vercel 中清除构建缓存
2. 重新触发部署

## 下一步

1. **查看 Vercel 日志** - 获取具体错误信息
2. **检查环境变量** - 确保所有必需变量已设置
3. **测试数据库连接** - 确认数据库可访问
4. **检查路由文件** - 确保所有路由正确导出

## 已添加的调试功能

- ✅ 详细的错误日志
- ✅ 数据库连接检查
- ✅ Prisma 查询日志（开发环境）

查看 Vercel 函数日志以获取更多信息。

