# 📸 Vercel Blob 存储设置指南

## 问题症状

照片上传失败，可能显示以下错误：
- "照片上傳失敗，請重試"
- "Blob storage not configured"
- "Failed to upload to blob storage"

## 🔍 原因

照片上传功能使用 **Vercel Blob** 存储，需要在 Vercel 中配置 `BLOB_READ_WRITE_TOKEN` 环境变量。

## ✅ 解决步骤

### 步骤 1: 创建 Vercel Blob Store

1. **进入 Vercel Dashboard**
   - 访问：https://vercel.com/dashboard
   - 选择你的项目：`ntu-dating-platform-kappa`

2. **进入 Storage 页面**
   - 点击左侧菜单 **Storage**
   - 或访问：https://vercel.com/dashboard/storage

3. **创建 Blob Store**
   - 点击 **Create Database** 或 **Add Storage**
   - 选择 **Blob**
   - 输入名称（例如：`dating-platform-blob`）
   - 选择区域（建议选择离你最近的区域）
   - 点击 **Create**

### 步骤 2: 获取 Blob Token

创建 Blob Store 后，Vercel 会自动生成一个 Token。你需要：

1. **找到 Token**
   - 在 Blob Store 详情页面
   - 找到 **Environment Variables** 或 **Token** 部分
   - 复制 Token（格式类似：`vercel_blob_rw_xxxxxxxxxxxxx`）

### 步骤 3: 设置环境变量

1. **进入项目设置**
   - 在 Vercel Dashboard 中，选择你的项目
   - 点击 **Settings** → **Environment Variables**

2. **添加环境变量**
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: 粘贴你刚才复制的 Token
   - **Environment**: 选择所有环境（Production, Preview, Development）
   - 点击 **Save**

### 步骤 4: 重新部署

设置环境变量后，需要重新部署：

1. **进入 Deployments 页面**
2. **找到最新部署**
3. **点击 ⋯ → Redeploy**
4. **选择 "Clear Build Cache"**（可选，但推荐）
5. **点击 Redeploy**

## 🔍 验证设置

部署完成后，尝试上传照片：

1. 登录你的账户
2. 进入个人资料页面
3. 尝试上传一张照片
4. 如果成功，照片应该会显示在个人资料中

## 📝 其他注意事项

### 如果仍然失败

1. **检查 Vercel 日志**
   - 进入 Deployments → 最新部署 → Functions
   - 查看 `/api/users/me/photos` 的日志
   - 查找错误信息

2. **检查环境变量**
   - 确认 `BLOB_READ_WRITE_TOKEN` 已正确设置
   - 确认 Token 格式正确（应该以 `vercel_blob_rw_` 开头）

3. **检查文件大小**
   - Vercel Blob 有文件大小限制
   - 建议上传的照片不超过 10MB

### 免费额度

Vercel Blob 提供免费额度：
- **存储**: 1 GB
- **带宽**: 100 GB/月
- **请求**: 100,000/月

对于个人项目，这通常足够使用。

## 🎯 快速检查清单

- [ ] 已创建 Vercel Blob Store
- [ ] 已复制 Blob Token
- [ ] 已在 Vercel 环境变量中设置 `BLOB_READ_WRITE_TOKEN`
- [ ] 已重新部署项目
- [ ] 已测试照片上传功能

