# 🔧 Vercel 部署修复指南

## 问题：找不到 Root Directory 设置

如果 Vercel Dashboard 中没有看到 Root Directory 选项，可以：

### 方法一：使用 vercel.json 配置文件（已创建）

我已经在项目根目录创建了 `vercel.json`，Vercel 会自动识别。

### 方法二：在 Settings → General 中查找

Root Directory 设置可能在：
1. **Settings** → **General** → 滚动到底部
2. 或者 **Settings** → **Build & Development Settings**

如果还是找不到，可能是因为：
- 项目还没有第一次部署
- 需要先触发一次部署

### 方法三：使用 Vercel CLI 部署（最简单）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 在项目根目录运行
cd /Users/caimanxuan/ntu-dating-platform
vercel

# 4. 按提示操作：
# - Set up and deploy? Yes
# - Which scope? 选择你的账号
# - Link to existing project? No（第一次部署）
# - What's your project's name? ntu-dating-platform
# - In which directory is your code located? ./frontend ⚠️ 重要！
# - Want to override the settings? No

# 5. 部署到生产环境
vercel --prod
```

### 方法四：重新导入项目

1. 删除当前 Vercel 项目（如果还没有重要数据）
2. 重新导入：
   - 点击 "Add New" → "Project"
   - 选择仓库
   - 在导入时，**手动设置 Root Directory 为 `frontend`**

## 📝 当前配置

项目根目录已经有 `vercel.json`，配置如下：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

这个配置告诉 Vercel：
- 从 `frontend/package.json` 构建
- 使用 Next.js 框架
- 所有路由都指向 frontend 目录

## 🚀 立即操作步骤

### 步骤 1: 推送最新代码
```bash
cd /Users/caimanxuan/ntu-dating-platform
git push origin main
```

### 步骤 2: 在 Vercel 中手动触发部署

1. 进入 Vercel 项目的 **Deployments** 标签页
2. 在 "Create Deployment" 部分
3. 在 "Commit or Branch Reference" 输入：`main`
4. 点击 **Create Deployment**

### 步骤 3: 检查部署日志

部署开始后，点击部署查看 Build Logs，确认：
- ✅ 正确识别了 Next.js 项目
- ✅ 在 `frontend` 目录中运行构建
- ✅ 构建成功

## ⚠️ 如果部署失败

查看 Build Logs 中的错误信息，常见问题：

1. **找不到 package.json**
   - 确认 `vercel.json` 中的路径正确
   - 确认 `frontend/package.json` 存在

2. **构建命令失败**
   - 检查 `frontend/package.json` 中的 scripts
   - 确认依赖已安装

3. **找不到 Next.js**
   - 确认 `frontend/package.json` 中有 `next` 依赖

## 📞 需要帮助？

如果还是无法部署，请提供：
1. Build Logs 的完整错误信息
2. Vercel 项目设置的截图
3. 具体的错误提示

