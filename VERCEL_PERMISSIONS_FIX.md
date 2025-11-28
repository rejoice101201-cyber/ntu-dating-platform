# 🔐 修复 Vercel 权限问题

## 错误信息

```
Deployment request did not have a git author with contributing access to the project on Vercel
```

## 问题原因

作为 **Collaborator**（合作者），你的 GitHub 账户可能没有足够的权限在 Vercel 中触发自动部署。

Vercel 需要：
- ✅ Git 仓库的 **写权限**（Write access）
- ✅ Vercel 项目的 **Developer** 或 **Admin** 权限

## 🔧 解决方案

### 方案一：请求项目所有者提升权限（推荐）

**需要项目所有者操作：**

1. **在 Vercel 中提升你的权限：**
   - 项目所有者进入 Vercel 项目
   - 点击 **Settings** → **Team** 或 **Members**
   - 找到你的账户
   - 将你的角色从 **Viewer** 改为 **Developer** 或 **Admin**

2. **在 GitHub 中检查仓库权限：**
   - 项目所有者进入 GitHub 仓库
   - 点击 **Settings** → **Collaborators**
   - 确认你的权限是 **Write**（写权限）

### 方案二：项目所有者手动触发部署

**项目所有者操作：**

1. 进入 Vercel 项目：`ntu-dating-platform-kappa`
2. 进入 **Deployments** 页面
3. 点击 **Create Deployment**
4. 选择：
   - Branch: `main`
   - Commit: 最新的 commit（例如：`006cb1e`）
5. 点击 **Deploy**

### 方案三：使用 Vercel CLI（如果你有 CLI 访问权限）

如果你已经通过 `vercel login` 登录，可以尝试：

```bash
cd /Users/caimanxuan/ntu-dating-platform
vercel --prod
```

**注意：** 这需要你的 Vercel 账户有项目访问权限。

### 方案四：项目所有者设置自动部署规则

**项目所有者操作：**

1. 进入 Vercel 项目 → **Settings** → **Git**
2. 找到 **Deployment Protection** 或 **Auto-deploy** 设置
3. 确保设置为允许所有有写权限的 Collaborator 触发部署

## 📋 需要检查的权限

### 在 Vercel 中：

- [ ] 你的账户在项目成员列表中
- [ ] 你的角色是 **Developer** 或 **Admin**（不是 **Viewer**）
- [ ] 项目设置允许 Collaborator 触发部署

### 在 GitHub 中：

- [ ] 你的账户在 Collaborators 列表中
- [ ] 你的权限是 **Write**（不是 **Read**）
- [ ] 仓库不是 Private 且限制了 Collaborator 权限

## 🚀 立即操作步骤

### 对于你（Collaborator）：

1. **联系项目所有者**，请求：
   - Vercel 项目权限提升到 **Developer** 或 **Admin**
   - 确认 GitHub 仓库有 **Write** 权限

2. **或者**，请项目所有者手动触发部署：
   - 告诉他们最新的 commit hash：`006cb1e`
   - 让他们在 Vercel 中手动部署

### 对于项目所有者：

1. **提升 Collaborator 权限：**
   ```
   Vercel 项目 → Settings → Team/Members → 
   找到 Collaborator → 改为 Developer/Admin
   ```

2. **检查 GitHub 权限：**
   ```
   GitHub 仓库 → Settings → Collaborators → 
   确认权限是 Write
   ```

3. **手动触发部署：**
   ```
   Vercel → Deployments → Create Deployment → 
   Branch: main, Commit: 006cb1e → Deploy
   ```

## 🔍 如何检查你的权限

### 在 Vercel 中：

1. 进入项目：`ntu-dating-platform-kappa`
2. 点击 **Settings** → **Team** 或 **Members**
3. 查看你的角色：
   - **Viewer** = 只能查看，不能部署 ❌
   - **Developer** = 可以部署 ✅
   - **Admin** = 完全权限 ✅

### 在 GitHub 中：

1. 进入仓库：`rejoice101201-cyber/ntu-dating-platform`
2. 查看右上角，你的权限显示：
   - **Read** = 只能读取 ❌
   - **Write** = 可以推送代码 ✅
   - **Admin** = 完全权限 ✅

## 💡 临时解决方案

如果无法立即获得权限，可以：

1. **请项目所有者手动部署**（最快）
2. **使用 Pull Request**：
   - 创建一个 PR
   - 项目所有者合并后会自动触发部署
3. **等待权限提升**后再推送代码

## 📝 当前状态

- **最新 commit**: `006cb1e` (trigger: 测试 Vercel 自动部署)
- **错误原因**: Collaborator 权限不足
- **需要**: Vercel Developer/Admin 权限 + GitHub Write 权限

## ✅ 解决后的验证

权限提升后：

1. 推送一个新的 commit
2. 等待 1-2 分钟
3. 检查 Vercel Deployments 页面
4. 应该看到自动部署开始

如果还是不行，检查：
- Vercel 项目设置中的部署保护规则
- GitHub webhook 是否正常工作
- Vercel 和 GitHub 的账户连接

