# 🔧 修复 Vercel 自动部署问题

## 问题：Git Push 后 Vercel 没有自动重新部署

如果推送代码到 GitHub 后，Vercel 没有自动触发部署，请按照以下步骤检查和修复。

## 🔍 检查步骤

### 1. 检查 Vercel 项目是否连接到 GitHub

1. 进入 Vercel 项目：`ntu-dating-platform-kappa`
2. 点击 **Settings**（设置）
3. 点击 **Git**（Git 设置）
4. 检查 **Connected Git Repository**（连接的 Git 仓库）

**应该显示：**
- Repository: `rejoice101201-cyber/ntu-dating-platform`
- Production Branch: `main`

**如果没有连接或连接错误：**
- 点击 **Disconnect**（断开连接）
- 然后点击 **Connect Git Repository**
- 搜索并选择正确的仓库：`rejoice101201-cyber/ntu-dating-platform`
- 选择 **main** 分支作为 Production Branch

### 2. 检查 GitHub Webhook

1. 进入 GitHub 仓库：`rejoice101201-cyber/ntu-dating-platform`
2. 点击 **Settings** → **Webhooks**
3. 检查是否有 Vercel 的 webhook

**应该看到：**
- Payload URL: `https://api.vercel.com/v1/integrations/deploy/...`
- Events: `push` 和 `pull_request`

**如果没有 webhook：**
- 回到 Vercel，重新连接 Git 仓库
- Vercel 会自动创建 webhook

### 3. 检查 Vercel 部署设置

1. 在 Vercel 项目中，进入 **Settings** → **Git**
2. 检查 **Production Branch** 是否为 `main`
3. 检查 **Auto-deploy** 是否开启（应该显示 ✅）

### 4. 手动触发部署

如果自动部署不工作，可以手动触发：

#### 方法一：在 Vercel 界面手动部署

1. 进入 Vercel 项目的 **Deployments**（部署）页面
2. 点击右上角的 **⋯**（三个点）
3. 选择 **Redeploy**（重新部署）
4. 或者点击 **Create Deployment**（创建部署）
5. 选择分支：`main`
6. 点击 **Deploy**

#### 方法二：使用 Vercel CLI

```bash
# 安装 Vercel CLI（如果还没安装）
npm i -g vercel

# 登录 Vercel
vercel login

# 在项目根目录部署
cd /Users/caimanxuan/ntu-dating-platform
vercel --prod
```

#### 方法三：推送一个空 commit 触发部署

```bash
cd /Users/caimanxuan/ntu-dating-platform
git commit --allow-empty -m "trigger: 触发 Vercel 重新部署"
git push origin main
```

## 🔧 常见问题和解决方案

### 问题 1：Vercel 显示 "No Git Repository Connected"

**解决：**
1. 在 Vercel 项目设置中，点击 **Connect Git Repository**
2. 选择正确的 GitHub 仓库
3. 授权 Vercel 访问仓库

### 问题 2：Webhook 返回 404 或错误

**解决：**
1. 在 GitHub 仓库的 Webhooks 设置中，删除旧的 webhook
2. 在 Vercel 中重新连接 Git 仓库
3. 检查 Vercel 是否有权限访问仓库

### 问题 3：部署触发但构建失败

**解决：**
1. 检查 Vercel 部署日志
2. 确认环境变量已正确设置（特别是 `NEXT_PUBLIC_API_URL`）
3. 检查 `vercel.json` 配置是否正确

### 问题 4：作为 Collaborator（合作者）没有部署权限

**解决：**
1. 确认项目所有者已给你部署权限
2. 在 Vercel 项目设置中，检查你的角色
3. 如果需要，请项目所有者给你 **Admin** 或 **Developer** 权限

## ✅ 验证自动部署是否工作

1. 创建一个测试文件：
   ```bash
   echo "test" > test-deploy.txt
   git add test-deploy.txt
   git commit -m "test: 测试自动部署"
   git push origin main
   ```

2. 在 Vercel 的 **Deployments** 页面观察
3. 应该会在几秒内看到新的部署开始

4. 部署完成后，删除测试文件：
   ```bash
   git rm test-deploy.txt
   git commit -m "test: 删除测试文件"
   git push origin main
   ```

## 📝 当前项目信息

- **Vercel 项目名**: `ntu-dating-platform-kappa`
- **Vercel URL**: `https://ntu-dating-platform-kappa.vercel.app`
- **GitHub 仓库**: `rejoice101201-cyber/ntu-dating-platform`
- **生产分支**: `main`
- **最新 commit**: `03bb118` (fix: 修复登录后跳回登录页的问题)

## 🚀 立即操作

1. **检查 Git 连接**：
   - Vercel → Settings → Git
   - 确认仓库连接正确

2. **手动触发部署**：
   - Deployments → Create Deployment → 选择 `main` 分支 → Deploy

3. **验证环境变量**：
   - Settings → Environment Variables
   - 确认 `NEXT_PUBLIC_API_URL` 已设置

4. **测试自动部署**：
   - 推送一个小的更改
   - 观察 Vercel 是否自动触发部署

