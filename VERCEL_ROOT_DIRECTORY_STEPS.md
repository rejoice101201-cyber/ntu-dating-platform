# 🔧 Vercel Root Directory 设置步骤（详细）

## ⚠️ 当前错误

```
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.
```

## ✅ 解决方案：在 Vercel 设置 Root Directory

### 步骤 1: 进入项目设置

1. 登录 Vercel
2. 进入项目：`ntu-dating-platform-kappa`
3. 点击 **Settings**（设置）

### 步骤 2: 找到 Root Directory 设置

1. 在左侧菜单中，点击 **General**（常规）
2. 滚动到页面底部
3. 找到 **Root Directory** 部分

**如果看不到 Root Directory：**
- 可能显示为 "Project Root" 或 "Base Directory"
- 或者可能在 **Build & Development Settings** 中

### 步骤 3: 设置 Root Directory

1. 点击 **Edit**（编辑）或 **Change**（更改）
2. 输入：`frontend`
3. 点击 **Save**（保存）

### 步骤 4: 重新部署

1. 进入 **Deployments**（部署）页面
2. 找到最新的部署
3. 点击右侧的 **⋯**（三个点）
4. 选择 **Redeploy**（重新部署）
5. 或等待自动部署（已推送新代码）

## 🔍 如果找不到 Root Directory 设置

### 方法 A: 在导入项目时设置

1. **删除当前项目**（如果还没有重要数据）
2. **重新导入项目**：
   - 点击 "Add New" → "Project"
   - 选择仓库：`rejoice101201-cyber/ntu-dating-platform`
   - 在导入配置中，找到 **Root Directory**
   - 设置为：`frontend`
   - 点击 **Deploy**

### 方法 B: 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 在项目根目录运行
cd /Users/caimanxuan/ntu-dating-platform
vercel

# 按提示操作，选择项目，设置 Root Directory 为 frontend
```

### 方法 C: 检查项目设置位置

Root Directory 可能在以下位置：

1. **Settings → General** → 滚动到底部
2. **Settings → Build & Development Settings** → Root Directory
3. **项目概览页面** → 右上角设置图标

## 📝 当前配置

我已经创建了根目录的 `vercel.json`：

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install",
  "framework": null,
  "rootDirectory": "frontend"
}
```

但 Vercel 可能仍然需要在项目设置中确认 Root Directory。

## 🎯 验证设置

设置 Root Directory 后，下次部署应该：

1. ✅ 在 `frontend` 目录安装依赖
2. ✅ 在 `frontend` 目录构建 Next.js
3. ✅ 使用 `frontend/.next` 作为输出目录
4. ✅ 成功检测到 Next.js 14.0.4

## 🆘 如果还是不行

### 检查清单

- [ ] 在 Vercel 项目设置中设置了 Root Directory 为 `frontend`
- [ ] 保存了设置
- [ ] 重新部署了项目
- [ ] 检查了部署日志

### 联系支持

如果以上都不行：
1. 检查 Vercel 项目设置中是否有其他配置冲突
2. 尝试删除项目并重新导入
3. 联系 Vercel 支持

## 💡 提示

**Root Directory 设置是必须的**，因为：
- 项目结构是 monorepo（前端和后端分开）
- Next.js 项目在 `frontend` 目录
- Vercel 需要知道在哪里查找 Next.js

设置 Root Directory 后，所有构建命令都会在 `frontend` 目录执行。

