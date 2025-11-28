# 🔧 修复照片上传 405 错误

## 问题症状

照片上传时出现 405 (Method Not Allowed) 错误：
```
POST /api/users/me/photos 405 (Method Not Allowed)
```

## 🔍 可能的原因

1. **Next.js 路由没有被正确识别**
   - 可能是 standalone 模式的问题
   - 或者路由文件没有被正确部署

2. **Vercel 部署缓存问题**
   - 旧的部署可能缓存了错误的路由配置

3. **文件大小限制**
   - Vercel 对请求体大小有限制（默认 4.5MB）

## ✅ 解决步骤

### 步骤 1: 检查 Vercel 日志

1. **进入 Vercel Dashboard**
   - 选择项目：`ntu-dating-platform-kappa`
   - 进入 **Deployments** → 最新部署 → **Functions**

2. **查看 `/api/users/me/photos` 的日志**
   - 查找是否有错误信息
   - 检查是否有 "Upload photo endpoint called" 日志

### 步骤 2: 清除构建缓存并重新部署

1. **进入 Deployments 页面**
2. **找到最新部署**
3. **点击 ⋯ → Redeploy**
4. **选择 "Clear Build Cache"**
5. **点击 Redeploy**

### 步骤 3: 检查环境变量

确保以下环境变量已设置：
- `DATABASE_URL` - 数据库连接
- `JWT_SECRET` - JWT 密钥
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob Token（照片存储）

### 步骤 4: 检查文件大小

如果上传的照片太大，可能会被拒绝：
- Vercel 默认限制：4.5MB
- 建议：压缩照片到 2MB 以下

### 步骤 5: 测试 API 路由

使用 curl 测试：

```bash
# 替换 YOUR_TOKEN 为实际的 JWT token
curl -X POST https://ntu-dating-platform-kappa.vercel.app/api/users/me/photos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/photo.jpg"
```

## 🔍 调试信息

### 检查路由是否正确导出

路由文件应该正确导出 POST 方法：
```typescript
// frontend/app/api/users/me/photos/route.ts
export async function POST(request: NextRequest) {
  // ...
}
```

### 检查浏览器控制台

在浏览器开发者工具中：
1. 打开 **Network** 标签
2. 尝试上传照片
3. 查看 `/api/users/me/photos` 请求
4. 检查请求头、响应状态码和响应体

### 检查 Vercel 函数日志

在 Vercel Dashboard 中：
1. 进入 **Logs** 标签
2. 筛选 `/api/users/me/photos`
3. 查看详细的错误信息

## 🎯 如果问题仍然存在

1. **检查 Next.js 版本**
   - 确保使用 Next.js 14.0.4 或更高版本

2. **尝试移除 standalone 模式**
   - 编辑 `frontend/next.config.js`
   - 移除 `output: 'standalone'`
   - 重新部署

3. **检查路由文件路径**
   - 确保文件在：`frontend/app/api/users/me/photos/route.ts`
   - 文件名必须是 `route.ts`（不是 `routes.ts` 或其他）

4. **联系 Vercel 支持**
   - 如果以上方法都不起作用，可能是 Vercel 平台的问题
   - 提供详细的错误日志和部署信息

## 📝 当前配置

- ✅ 已添加 `export const runtime = 'nodejs'`
- ✅ 已添加 OPTIONS 处理（CORS）
- ✅ 已添加详细的错误日志
- ✅ 已添加 BLOB_READ_WRITE_TOKEN 检查

