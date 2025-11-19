# 🚀 Vercel 部署配置指南

## ⚠️ 重要：项目根目录设置

由于项目结构是：
```
ntu-dating-platform/
├── frontend/     ← Next.js 项目在这里
└── backend/      ← 后端代码
```

**必须在 Vercel 中设置 Root Directory 为 `frontend`**

## 📝 Vercel 项目设置步骤

### 1. 在 Vercel Dashboard 中配置

进入项目设置 → **Settings** → **General**

找到 **Root Directory** 设置：

1. 点击 **Edit**
2. 选择 **Root Directory**
3. 输入：`frontend`
4. 点击 **Save**

### 2. 检查 Build & Development Settings

在 **Settings** → **Build & Development Settings** 中：

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`（会自动检测，不需要修改）
- **Output Directory**: `.next`（会自动检测，不需要修改）
- **Install Command**: `npm install`（会自动检测，不需要修改）

### 3. 手动触发部署

如果设置后还是没有部署：

1. 进入 **Deployments** 标签页
2. 点击右上角 **...** 菜单
3. 选择 **Redeploy**
4. 选择 **Use existing Build Cache** 或 **Rebuild**
5. 点击 **Redeploy**

### 4. 检查部署日志

如果部署失败：

1. 点击失败的部署
2. 查看 **Build Logs**
3. 检查错误信息

常见错误：
- ❌ `Cannot find module` → 检查 Root Directory 是否正确
- ❌ `Command not found` → 检查 Build Command
- ❌ `ENOENT` → 检查文件路径

## 🔧 如果 Root Directory 设置不生效

### 方法一：使用 vercel.json（已创建）

项目根目录已经有 `frontend/vercel.json`，Vercel 应该会自动识别。

### 方法二：在项目根目录创建 vercel.json

如果还是不行，可以在**项目根目录**创建 `vercel.json`：

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm install",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs"
}
```

### 方法三：使用 Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 在项目根目录部署
cd /Users/caimanxuan/ntu-dating-platform
vercel

# 按提示操作，选择 frontend 作为根目录
```

## 📋 检查清单

部署前确认：

- [ ] Root Directory 设置为 `frontend`
- [ ] Framework Preset 选择 Next.js
- [ ] 环境变量 `NEXT_PUBLIC_API_URL` 已设置（可以先不设置，等后端部署后）
- [ ] 项目已连接到正确的 GitHub 仓库
- [ ] 有推送权限到 main 分支

## 🐛 故障排除

### 问题 1: "No Production Deployment"

**解决方案：**
1. 检查 Root Directory 是否设置为 `frontend`
2. 手动触发一次部署
3. 检查 Build Logs 是否有错误

### 问题 2: Build 失败

**检查：**
1. 查看 Build Logs 的具体错误
2. 确认 `frontend/package.json` 存在
3. 确认 `frontend/next.config.js` 存在

### 问题 3: 找不到文件

**解决方案：**
- 确认 Root Directory 正确
- 检查文件路径是否正确

## 📞 需要帮助？

如果还是无法部署，请提供：
1. Build Logs 的错误信息
2. Vercel 项目设置的截图
3. 具体的错误信息

