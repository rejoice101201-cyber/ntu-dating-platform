# 🔧 修复 Vercel Root Directory 问题

## 错误信息

```
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.
```

## 问题原因

Vercel 在根目录查找 Next.js，但项目在 `frontend` 目录。

## ✅ 解决方案

### 方法一：在 Vercel 设置 Root Directory（推荐）

1. **进入 Vercel 项目**
   - 项目：`ntu-dating-platform-kappa`
   - Settings → **General**

2. **找到 Root Directory 设置**
   - 滚动到底部
   - 找到 **Root Directory**
   - 点击 **Edit**

3. **设置 Root Directory**
   - 输入：`frontend`
   - 点击 **Save**

4. **重新部署**
   - Deployments → 找到最新部署 → ⋯ → Redeploy

### 方法二：使用 frontend/vercel.json（已配置）

我已经删除了根目录的 `vercel.json`，只保留 `frontend/vercel.json`。

如果 Vercel 仍然无法识别，请使用方法一（在 Vercel 设置中指定 Root Directory）。

## 📝 当前配置

- ✅ 根目录 `vercel.json` 已删除
- ✅ `frontend/vercel.json` 已配置
- ⚠️ 需要在 Vercel 设置 Root Directory 为 `frontend`

## 🚀 立即操作

1. **进入 Vercel 项目设置**
2. **Settings → General → Root Directory**
3. **设置为：`frontend`**
4. **保存并重新部署**

