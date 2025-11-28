# 🔧 修复 Vercel MEMBER 角色权限问题

## 当前状态

你已收到 Vercel 团队邀请，角色是 **MEMBER**。

## ⚠️ 问题

**MEMBER 角色可能权限不足**，无法触发自动部署。Vercel 的角色权限如下：

- **VIEWER** - 只能查看，不能部署 ❌
- **MEMBER** - 基本成员，可能无法触发部署 ⚠️
- **DEVELOPER** - 可以部署和修改设置 ✅
- **ADMIN** - 完全权限 ✅

## 🔧 解决方案

### 方案一：请求提升到 DEVELOPER 角色（推荐）

**需要项目所有者操作：**

1. 项目所有者进入 Vercel 项目
2. 点击 **Settings** → **Team** 或 **Members**
3. 找到你的账户（`mollytsai5617-6020`）
4. 将角色从 **MEMBER** 改为 **DEVELOPER** 或 **ADMIN**

### 方案二：检查项目部署设置

**项目所有者需要检查：**

1. 进入项目 **Settings** → **Git**
2. 找到 **Deployment Protection** 或类似设置
3. 确保允许 MEMBER 角色触发部署
4. 或者暂时禁用部署保护

### 方案三：使用 Pull Request 触发部署

如果无法立即获得 DEVELOPER 权限，可以：

1. **创建 Pull Request**：
   ```bash
   git checkout -b feature/test-deploy
   git commit --allow-empty -m "test: PR 测试部署"
   git push origin feature/test-deploy
   ```

2. **在 GitHub 创建 PR**
3. **项目所有者合并 PR**
4. **合并后会自动触发部署**

### 方案四：请项目所有者手动部署

请项目所有者：

1. 进入 Vercel 项目
2. **Deployments** → **Create Deployment**
3. 选择 Branch: `main`
4. 点击 **Deploy**

## 📋 需要检查的事项

### 在 Vercel 中：

- [ ] 确认你已加入团队（收到邀请邮件 ✅）
- [ ] 检查你的角色（当前是 MEMBER）
- [ ] 请求提升到 DEVELOPER 或 ADMIN
- [ ] 确认项目设置允许成员触发部署

### 在 GitHub 中：

- [ ] 确认你有 Write 权限
- [ ] 确认可以推送代码到仓库

## 🚀 立即操作步骤

### 对于你：

1. **联系项目所有者**（`r14631031@g.ntu.edu.tw`），请求：
   - 将你的角色从 MEMBER 提升到 DEVELOPER
   - 或者调整项目设置允许 MEMBER 触发部署

2. **或者**，使用 Pull Request 方式：
   - 创建新分支
   - 推送代码
   - 创建 PR
   - 等待合并后自动部署

### 对于项目所有者：

1. **提升成员权限**：
   ```
   Vercel 项目 → Settings → Team/Members → 
   找到 mollytsai5617-6020 → 改为 DEVELOPER
   ```

2. **检查部署设置**：
   ```
   Settings → Git → Deployment Protection → 
   确保允许成员触发部署
   ```

## 💡 为什么 MEMBER 角色可能不够

Vercel 的部署权限通常需要：
- **DEVELOPER** 或更高角色才能触发自动部署
- **MEMBER** 角色主要用于查看和基本操作
- 某些项目可能设置了部署保护，只允许特定角色部署

## ✅ 验证

获得 DEVELOPER 权限后：

1. **推送测试 commit**：
   ```bash
   git commit --allow-empty -m "test: 测试 DEVELOPER 权限"
   git push origin main
   ```

2. **等待 1-2 分钟**
3. **检查 Vercel Deployments 页面**
4. **应该看到自动部署开始**

## 📝 当前信息

- **你的 Vercel 账户**: `mollytsai5617-6020`
- **团队**: `socialmedias-projects-bc8a18b0`
- **当前角色**: MEMBER
- **需要角色**: DEVELOPER 或 ADMIN
- **项目所有者**: `r14631031@g.ntu.edu.tw`

## 🎯 最佳解决方案

**立即联系项目所有者**（`r14631031@g.ntu.edu.tw`），请求：

1. 将你的 Vercel 角色从 **MEMBER** 提升到 **DEVELOPER**
2. 或者确认项目设置允许 MEMBER 触发部署

这是最快和最直接的解决方案。

