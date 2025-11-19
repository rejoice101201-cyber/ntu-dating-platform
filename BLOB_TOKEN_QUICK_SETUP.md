# 🚀 快速设置 BLOB_READ_WRITE_TOKEN

## 错误信息

```
Blob storage not configured. Please set BLOB_READ_WRITE_TOKEN in Vercel environment variables
```

## ✅ 解决步骤（5分钟）

### 步骤 1: 创建 Vercel Blob Store

1. **进入 Vercel Dashboard**
   - 访问：https://vercel.com/dashboard
   - 登录你的账户

2. **进入 Storage 页面**
   - 点击左侧菜单 **Storage**（存储）
   - 或直接访问：https://vercel.com/dashboard/storage

3. **创建 Blob Store**
   - 点击 **Create Database** 或 **Add Storage** 按钮
   - 选择 **Blob**（不是 Postgres 或其他）
   - 输入名称：`dating-platform-blob`（或任何你喜欢的名称）
   - 选择区域：选择离你最近的区域（如 `iad1` 或 `sfo1`）
   - 点击 **Create**

### 步骤 2: 获取 Token

创建 Blob Store 后：

1. **进入 Blob Store 详情页面**
   - 点击你刚创建的 Blob Store

2. **找到 Environment Variables 部分**
   - 在页面中查找 **Environment Variables** 或 **Token** 部分
   - 你会看到一个 Token，格式类似：`vercel_blob_rw_xxxxxxxxxxxxx`

3. **复制 Token**
   - 点击复制按钮或手动复制整个 Token

### 步骤 3: 设置环境变量

1. **进入项目设置**
   - 在 Vercel Dashboard 中，选择项目：`ntu-dating-platform-kappa`
   - 点击 **Settings**（设置）
   - 点击 **Environment Variables**（环境变量）

2. **添加环境变量**
   - 点击 **Add New** 或 **Add** 按钮
   - **Name（名称）**: `BLOB_READ_WRITE_TOKEN`
   - **Value（值）**: 粘贴你刚才复制的 Token
   - **Environment（环境）**: 选择所有环境
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - 点击 **Save**（保存）

### 步骤 4: 重新部署

设置环境变量后，必须重新部署才能生效：

1. **进入 Deployments 页面**
   - 在项目页面，点击 **Deployments** 标签

2. **重新部署**
   - 找到最新的部署
   - 点击右侧的 **⋯**（三个点）
   - 选择 **Redeploy**（重新部署）
   - **重要**：勾选 **"Clear Build Cache"**（清除构建缓存）
   - 点击 **Redeploy**

3. **等待部署完成**
   - 部署通常需要 1-3 分钟
   - 等待部署状态变为 **Ready**（绿色）

### 步骤 5: 测试照片上传

部署完成后：

1. **登录你的账户**
   - 访问：https://ntu-dating-platform-kappa.vercel.app/auth/login

2. **进入个人资料页面**
   - 点击底部导航的 **个人资料**

3. **尝试上传照片**
   - 点击 **上传照片** 按钮
   - 选择一张照片
   - 等待上传完成

4. **验证成功**
   - 如果照片显示在个人资料中，说明设置成功！

## 🔍 如果仍然失败

### 检查环境变量

1. **确认环境变量已设置**
   - 进入 Settings → Environment Variables
   - 确认 `BLOB_READ_WRITE_TOKEN` 存在
   - 确认值不为空

2. **确认 Token 格式正确**
   - Token 应该以 `vercel_blob_rw_` 开头
   - 长度大约 40-50 个字符

### 检查 Vercel 日志

1. **进入 Functions 日志**
   - Deployments → 最新部署 → Functions
   - 查看 `/api/users/me/photos` 的日志
   - 查找具体的错误信息

### 常见问题

**Q: 我找不到 Storage 页面**
- A: 确保你使用的是 Vercel 的付费计划或团队计划。免费计划可能不支持 Blob Storage。如果确实没有，可以考虑使用其他存储方案（如 Cloudinary）。

**Q: Token 在哪里？**
- A: 在 Blob Store 详情页面的 **Environment Variables** 部分，或者点击 **Settings** 标签查看。

**Q: 设置后仍然失败**
- A: 确保已经重新部署，并且选择了 "Clear Build Cache"。环境变量只在重新部署后生效。

## 📝 快速检查清单

- [ ] 已创建 Vercel Blob Store
- [ ] 已复制 Blob Token
- [ ] 已在项目环境变量中设置 `BLOB_READ_WRITE_TOKEN`
- [ ] 已选择所有环境（Production, Preview, Development）
- [ ] 已重新部署并清除构建缓存
- [ ] 已测试照片上传功能

## 🎯 完成！

设置完成后，照片上传功能应该可以正常工作了。如果还有问题，请查看 Vercel 日志中的详细错误信息。

