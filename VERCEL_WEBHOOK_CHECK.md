# 🔍 检查 Vercel 自动部署 Webhook

## 当前状态

根据你提供的信息：
- ✅ Git 仓库已连接：`rejoice101201-cyber/ntu-dating-platform`
- ✅ 连接时间：10分钟前
- ⚠️ 自动部署可能未触发

## 🔧 检查步骤

### 1. 检查 GitHub Webhook

1. 进入 GitHub 仓库：`rejoice101201-cyber/ntu-dating-platform`
2. 点击 **Settings** → **Webhooks**
3. 查找 Vercel 的 webhook

**应该看到：**
- Payload URL: `https://api.vercel.com/v1/integrations/deploy/...`
- Content type: `application/json`
- Events: ✅ `push`, ✅ `pull_request`
- Active: ✅ 绿色勾号

**如果没有 webhook 或显示错误：**
- 回到 Vercel，点击 **Disconnect** 然后重新 **Connect**
- 或者手动添加 webhook（不推荐，让 Vercel 自动管理）

### 2. 检查 Vercel 部署设置

在 Vercel 项目中：

1. **Settings** → **Git** → 确认：
   - Production Branch: `main` ✅
   - Auto-deploy: 应该是开启的 ✅

2. **Settings** → **General** → 检查：
   - Root Directory: 应该是 `frontend` 或空（使用 vercel.json）
   - Framework Preset: Next.js

### 3. 检查 "Ignored Build Step"

在 **Settings** → **Git** 中，找到 **Ignored Build Step**：

- 应该设置为 **Automatic**（自动）
- 如果有自定义命令，确保它不会阻止所有部署

### 4. 测试自动部署

我已经推送了一个测试 commit，现在：

1. **等待 1-2 分钟**
2. 进入 Vercel 的 **Deployments** 页面
3. 查看是否有新的部署开始

**如果还是没有自动部署：**

#### 方法 A：手动触发部署

1. 进入 **Deployments** 页面
2. 点击 **Create Deployment**
3. 选择：
   - Branch: `main`
   - Commit: 最新的 commit hash
4. 点击 **Deploy**

#### 方法 B：重新连接 Git 仓库

1. **Settings** → **Git**
2. 点击 **Disconnect**
3. 等待几秒
4. 点击 **Connect Git Repository**
5. 选择：`rejoice101201-cyber/ntu-dating-platform`
6. 选择分支：`main`
7. 点击 **Connect**

### 5. 检查部署日志

如果部署失败：

1. 进入 **Deployments** 页面
2. 点击失败的部署
3. 查看 **Build Logs**
4. 检查错误信息

## 🐛 常见问题

### 问题 1：Webhook 显示 "Recent Deliveries" 都是失败的

**原因：** Webhook 配置错误或 Vercel API 密钥过期

**解决：**
1. 在 Vercel 中重新连接 Git 仓库
2. 这会自动更新 webhook

### 问题 2：Webhook 存在但部署不触发

**原因：** 可能是 GitHub 的 webhook 延迟或 Vercel 服务问题

**解决：**
1. 等待 2-3 分钟
2. 如果还是没有，手动触发部署
3. 检查 Vercel Status 页面：https://www.vercel-status.com/

### 问题 3：作为 Collaborator 没有部署权限

**原因：** 项目所有者可能限制了部署权限

**解决：**
1. 联系项目所有者
2. 请求 **Developer** 或 **Admin** 权限
3. 或者让项目所有者手动触发部署

### 问题 4：部署触发但构建失败

**原因：** 代码错误、环境变量缺失、或配置问题

**解决：**
1. 查看构建日志
2. 检查环境变量（特别是 `NEXT_PUBLIC_API_URL`）
3. 检查 `vercel.json` 配置

## ✅ 验证清单

完成以下检查：

- [ ] GitHub Webhook 存在且状态为 Active
- [ ] Vercel Git 连接显示正确的仓库
- [ ] Production Branch 设置为 `main`
- [ ] Root Directory 已正确设置（或使用 vercel.json）
- [ ] 环境变量 `NEXT_PUBLIC_API_URL` 已设置
- [ ] 测试 commit 已推送
- [ ] 在 Vercel Deployments 页面观察是否有新部署

## 🚀 下一步

1. **立即检查**：进入 Vercel Deployments 页面，看是否有新部署
2. **如果还是没有**：使用上面的方法手动触发部署
3. **如果持续有问题**：重新连接 Git 仓库

## 📝 当前信息

- **最新 commit**: `8d52688` (docs: 添加 Vercel 自动部署问题修复指南)
- **测试 commit**: 刚刚推送的 `trigger: 测试 Vercel 自动部署`
- **Vercel 项目**: `ntu-dating-platform-kappa`
- **GitHub 仓库**: `rejoice101201-cyber/ntu-dating-platform`

