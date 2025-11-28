# 🔧 修复 Vercel "branch not found" 错误

## 问题原因

Vercel 显示的错误 "The provided GitHub repository does not contain the requested branch or commit reference" 可能是因为：

1. **仓库 URL 不匹配**
   - Vercel 连接的可能是：`r12944069/ntu-dating-platform`
   - 实际仓库是：`rejoice101201-cyber/ntu-dating-platform`

2. **Vercel 还没有同步最新代码**
   - 需要等待几分钟让 Vercel 同步

3. **分支名称问题**
   - 确认使用 `main` 而不是 `master`

## 🔧 解决方案

### 方法一：检查并更新 Vercel 仓库连接

1. **进入 Vercel 项目设置**
   - Settings → **Git**

2. **检查连接的仓库**
   - 确认仓库 URL 是否正确
   - 应该是：`rejoice101201-cyber/ntu-dating-platform`

3. **如果仓库不对，重新连接**
   - 点击 **Disconnect**
   - 然后重新连接正确的仓库

### 方法二：使用完整的 commit hash

在 "Commit or Branch Reference" 输入框中，不要输入 `main`，而是输入完整的 commit hash：

```
684b361
```

或者：

```
684b361fix: 更新 vercel.json 配置，使用正确的构建路径
```

### 方法三：使用 Vercel CLI 部署

```bash
cd /Users/caimanxuan/ntu-dating-platform

# 安装 Vercel CLI（如果还没安装）
npm i -g vercel

# 登录
vercel login

# 部署（会自动使用当前分支）
vercel --prod
```

### 方法四：重新导入项目

如果以上都不行，可以：

1. **删除当前 Vercel 项目**（如果还没有重要数据）
2. **重新导入**：
   - 点击 "Add New" → "Project"
   - 搜索：`rejoice101201-cyber/ntu-dating-platform`
   - 选择正确的仓库
   - 在导入时设置 Root Directory 为 `frontend`

## 📝 当前仓库信息

- **仓库 URL**: `rejoice101201-cyber/ntu-dating-platform`
- **默认分支**: `main`
- **最新 commit**: `684b361`

## ✅ 立即尝试

1. **在 Vercel 的 "Commit or Branch Reference" 输入**：
   - 输入：`684b361`（最新的 commit hash）
   - 或者输入：`main`
   - 点击 Create Deployment

2. **如果还是不行，检查 Git 连接**：
   - 在 Vercel Settings → Git
   - 确认仓库 URL 是 `rejoice101201-cyber/ntu-dating-platform`

3. **或者使用 Vercel CLI**（最可靠）：
   ```bash
   vercel --prod
   ```

