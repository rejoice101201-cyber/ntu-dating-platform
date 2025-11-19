# 🔧 修复 Vercel 部署后登录跳回问题

## 问题症状

- ✅ 登录成功
- ❌ 立即跳回登录页面
- ❌ 控制台可能有网络错误

## 🔍 根本原因

**最可能的原因：`NEXT_PUBLIC_API_URL` 环境变量没有设置或设置错误**

在 Vercel 上，如果 `NEXT_PUBLIC_API_URL` 没有设置：
- API URL 会回退到 `http://localhost:5001/api`
- 前端无法连接到后端 API
- API 请求失败，触发 401 错误
- 自动重定向回登录页面

## ✅ 解决方案

### 步骤 1：在 Vercel 设置环境变量（最重要！）

1. **进入 Vercel 项目**
2. **Settings** → **Environment Variables**
3. **添加环境变量**：
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://你的后端域名/api`
   - **Environment**: 选择所有环境（Production, Preview, Development）

**示例：**
- 如果后端在 Railway: `https://your-backend.railway.app/api`
- 如果后端在其他地方: `https://your-backend-domain.com/api`

### 步骤 2：重新部署

设置环境变量后：

1. **进入 Deployments 页面**
2. **找到最新部署**
3. **点击 ⋯ → Redeploy**
4. **或者推送新的 commit 触发自动部署**

### 步骤 3：验证环境变量

部署后，在浏览器控制台检查：

```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```

应该显示你设置的后端 API URL，而不是 `http://localhost:5001/api`。

## 🔍 如何检查问题

### 方法 1：浏览器开发者工具

1. **打开网站**
2. **按 F12 打开开发者工具**
3. **查看 Console（控制台）**
   - 应该看到 `API URL: ...`
   - 如果有错误，会显示网络错误信息

4. **查看 Network（网络）标签**
   - 尝试登录
   - 查看 API 请求
   - 检查请求 URL 是否正确
   - 检查请求是否失败（红色）

### 方法 2：检查环境变量

在浏览器控制台运行：

```javascript
// 检查 API URL
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)

// 检查是否有 token
console.log('Token:', localStorage.getItem('token'))
```

## 🐛 常见错误

### 错误 1：`Failed to fetch` 或 `Network Error`

**原因：** API URL 不正确或后端无法访问

**解决：**
1. 检查 `NEXT_PUBLIC_API_URL` 是否正确设置
2. 确认后端服务正在运行
3. 检查后端 CORS 设置是否允许 Vercel 域名

### 错误 2：`401 Unauthorized`

**原因：** Token 无效或过期

**解决：**
1. 清除浏览器缓存和 localStorage
2. 重新登录
3. 检查后端 JWT 验证是否正常

### 错误 3：`CORS policy` 错误

**原因：** 后端没有允许 Vercel 域名的跨域请求

**解决：**
在后端 CORS 设置中添加 Vercel 域名：

```javascript
// backend/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ntu-dating-platform-kappa.vercel.app',
    'https://你的自定义域名.com'
  ],
  credentials: true
}))
```

## 📋 完整检查清单

- [ ] Vercel 环境变量 `NEXT_PUBLIC_API_URL` 已设置
- [ ] 环境变量值是正确的后端 API URL
- [ ] 环境变量在所有环境（Production, Preview）都设置了
- [ ] 已重新部署（设置环境变量后）
- [ ] 后端服务正在运行
- [ ] 后端 CORS 允许 Vercel 域名
- [ ] 浏览器控制台没有网络错误
- [ ] API URL 在控制台显示正确（不是 localhost）

## 🚀 立即操作

1. **检查 Vercel 环境变量**：
   - Settings → Environment Variables
   - 确认 `NEXT_PUBLIC_API_URL` 已设置

2. **如果未设置，立即设置**：
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: 你的后端 API URL
   - 选择所有环境

3. **重新部署**：
   - Deployments → Redeploy
   - 或推送新 commit

4. **测试登录**：
   - 清除浏览器缓存
   - 尝试登录
   - 检查是否还会跳回登录页

## 💡 调试技巧

### 在浏览器控制台检查：

```javascript
// 1. 检查 API URL
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)

// 2. 检查 token
console.log('Token:', localStorage.getItem('token'))

// 3. 测试 API 连接
fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

## ✅ 验证修复

修复后应该：

1. ✅ 登录成功
2. ✅ 跳转到 `/discover` 页面（不是登录页）
3. ✅ 可以正常使用所有功能
4. ✅ 浏览器控制台没有网络错误
5. ✅ API 请求成功（在 Network 标签中看到 200 状态）

## 📝 当前代码改进

我已经更新了代码：

1. **改进了错误处理**：网络错误不会立即跳转登录
2. **添加了调试日志**：开发环境会显示 API URL
3. **改进了认证检查**：使用 localStorage 作为后备

但**最重要的是设置正确的 `NEXT_PUBLIC_API_URL` 环境变量**！

