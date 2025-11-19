# 🔧 修复 Sharp 模块错误

## 问题症状

照片上传时出现错误：
```
Error: Could not load the "sharp" module using the linux-x64 runtime
```

## ✅ 已实施的修复

1. **更新安装命令**
   - 使用 `npm ci --include=optional` 确保可选依赖被安装
   - 这包括 `sharp` 的平台特定二进制文件

2. **添加环境变量**
   - 在 `vercel.json` 中添加了 `SHARP_IGNORE_GLOBAL_LIBVIPS=1`

## 🔧 额外步骤：在 Vercel Dashboard 设置环境变量

为了确保 `sharp` 正常工作，请在 Vercel Dashboard 中手动设置环境变量：

### 步骤：

1. **进入 Vercel 项目**
   - 项目：`ntu-dating-platform-kappa`
   - Settings → **Environment Variables**

2. **添加环境变量**
   - **Name**: `SHARP_IGNORE_GLOBAL_LIBVIPS`
   - **Value**: `1`
   - **Environment**: 选择所有环境（Production, Preview, Development）
   - 点击 **Save**

3. **重新部署**
   - Deployments → 最新部署 → ⋯ → Redeploy
   - 选择 **Clear Build Cache**
   - 点击 **Redeploy**

## 📝 关于登录/注册错误

如果你遇到登录/注册的 401/400 错误：

1. **确保已注册账户**
   - 访问：`https://ntu-dating-platform-kappa.vercel.app/auth/register`
   - 使用你的邮箱注册新账户

2. **检查环境变量**
   - 确保 `DATABASE_URL` 已设置（Vercel Postgres）
   - 确保 `JWT_SECRET` 已设置

3. **检查数据库**
   - 确认 Vercel Postgres 数据库已创建
   - 确认数据库连接正常

## 🎯 验证修复

部署完成后：

1. **尝试上传照片**
   - 登录账户
   - 进入个人资料页面
   - 尝试上传一张照片
   - 应该不再出现 `sharp` 错误

2. **检查 Vercel 日志**
   - 如果仍然失败，查看 Functions 日志
   - 查找具体的错误信息

## 🔍 如果问题仍然存在

如果 `sharp` 仍然无法加载，可以尝试：

1. **升级 sharp 版本**
   ```bash
   npm install sharp@latest
   ```

2. **使用平台特定的 sharp**
   ```bash
   npm install @img/sharp-linux-x64
   ```

3. **检查 Vercel 构建日志**
   - 查看安装阶段是否有错误
   - 确认 `sharp` 是否被正确安装

