# 🔧 Vercel 环境变量设置指南

## ⚠️ 重要：部署前必须设置环境变量

在 Vercel 上部署后，如果登录后跳回登录页面，很可能是 **API URL 没有正确设置**。

## 📝 设置步骤

### 1. 进入 Vercel 项目设置

1. 打开你的 Vercel 项目
2. 点击 **Settings**（设置）
3. 点击 **Environment Variables**（环境变量）

### 2. 添加必需的环境变量

添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_API_URL` | `https://你的后端域名/api` | 后端 API 的完整 URL |

**示例：**
- 如果后端部署在 Railway：`https://your-backend.railway.app/api`
- 如果后端部署在其他地方：`https://your-backend-domain.com/api`

### 3. 设置环境范围

确保环境变量在以下环境都可用：
- ✅ **Production**（生产环境）
- ✅ **Preview**（预览环境）
- ✅ **Development**（开发环境，如果需要）

### 4. 重新部署

设置完环境变量后：

1. 进入 **Deployments**（部署）页面
2. 点击最新部署右侧的 **⋯**（三个点）
3. 选择 **Redeploy**（重新部署）

或者：

1. 推送一个新的 commit 到 GitHub
2. Vercel 会自动触发新的部署

## 🔍 如何检查环境变量是否正确设置

### 方法一：在浏览器控制台检查

1. 打开部署的网站
2. 按 `F12` 打开开发者工具
3. 在 Console（控制台）输入：
   ```javascript
   console.log(process.env.NEXT_PUBLIC_API_URL)
   ```
4. 应该显示你设置的后端 API URL

### 方法二：检查网络请求

1. 打开开发者工具的 **Network**（网络）标签
2. 尝试登录
3. 查看请求的 URL
4. 应该指向你设置的后端 API URL，而不是 `http://localhost:5001`

## 🐛 常见问题

### 问题 1：登录后跳回登录页面

**原因：**
- `NEXT_PUBLIC_API_URL` 没有设置或设置错误
- 前端无法连接到后端 API

**解决：**
1. 检查 Vercel 环境变量设置
2. 确认后端 API 可以正常访问
3. 检查后端 CORS 设置是否允许 Vercel 域名

### 问题 2：CORS 错误

**原因：**
- 后端没有允许 Vercel 域名的跨域请求

**解决：**
在后端的 CORS 设置中添加你的 Vercel 域名：
```javascript
// backend/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}))
```

### 问题 3：环境变量不生效

**原因：**
- 环境变量名称必须以 `NEXT_PUBLIC_` 开头才能在客户端使用
- 需要重新部署才能生效

**解决：**
1. 确认变量名是 `NEXT_PUBLIC_API_URL`（不是 `API_URL`）
2. 设置后点击 **Redeploy**（重新部署）

## 📋 完整的环境变量列表

### 前端（Vercel）需要的环境变量：

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

### 后端（Railway/其他）需要的环境变量：

```bash
DATABASE_URL=你的数据库连接字符串
JWT_SECRET=你的JWT密钥
PORT=5001
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## ✅ 验证部署

设置完成后，测试以下功能：

1. ✅ 注册新用户
2. ✅ 登录
3. ✅ 登录后不会跳回登录页面
4. ✅ 可以查看推荐用户
5. ✅ 可以查看配对列表
6. ✅ 可以发送消息

如果所有功能都正常，说明环境变量设置成功！

