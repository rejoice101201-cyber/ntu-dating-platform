# 🌐 Vercel 域名说明

## 你的 Vercel 域名

1. **`ntu-dating-platform-kappa.vercel.app`**
   - 这是**生产环境**（Production）
   - 主要的访问域名
   - 对应 `main` 分支的最新部署

2. **`ntu-dating-platform-git-main-socialmedias-projects-bc8a18b0.vercel.app`**
   - 这是 `main` 分支的**预览部署**（Preview）
   - 每次推送到 `main` 分支都会更新

3. **`ntu-dating-platform-1ei56ywpf-socialmedias-projects-bc8a18b0.vercel.app`**
   - 这是某个特定 commit 的**预览部署**
   - 用于测试特定版本的部署

## 🔧 重要配置

### 1. 环境变量设置

在 Vercel 中，需要为**所有环境**设置 `NEXT_PUBLIC_API_URL`：

1. **进入 Vercel 项目**
2. **Settings** → **Environment Variables**
3. **添加环境变量**：
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://你的后端域名/api`
   - **Environment**: 选择所有环境：
     - ✅ Production
     - ✅ Preview
     - ✅ Development

### 2. 后端 CORS 设置

在后端，需要允许这些 Vercel 域名的跨域请求：

```javascript
// backend/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ntu-dating-platform-kappa.vercel.app',
    'https://ntu-dating-platform-git-main-socialmedias-projects-bc8a18b0.vercel.app',
    /^https:\/\/ntu-dating-platform-.*\.vercel\.app$/, // 允许所有预览域名
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
```

或者更简单的方式，允许所有 Vercel 预览域名：

```javascript
app.use(cors({
  origin: (origin, callback) => {
    // 允许 localhost
    if (!origin || origin.includes('localhost')) {
      return callback(null, true);
    }
    // 允许所有 Vercel 域名
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    // 允许你的生产域名
    if (origin === 'https://ntu-dating-platform-kappa.vercel.app') {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}))
```

## 📋 检查清单

- [ ] 在 Vercel 设置了 `NEXT_PUBLIC_API_URL` 环境变量
- [ ] 环境变量在所有环境（Production, Preview）都设置了
- [ ] 后端 CORS 允许所有 Vercel 域名
- [ ] 后端服务正在运行
- [ ] 测试生产域名登录功能
- [ ] 测试预览域名登录功能

## 🚀 测试步骤

### 测试生产环境

1. 访问：`https://ntu-dating-platform-kappa.vercel.app`
2. 尝试登录
3. 检查是否正常工作

### 测试预览环境

1. 访问：`https://ntu-dating-platform-git-main-socialmedias-projects-bc8a18b0.vercel.app`
2. 尝试登录
3. 检查是否正常工作

## 💡 提示

- **生产域名**是用户主要访问的域名
- **预览域名**用于测试新功能
- 所有域名都需要正确的环境变量配置
- 后端需要允许所有 Vercel 域名的 CORS 请求

## 🔍 如何检查环境变量是否正确

在浏览器控制台运行：

```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
```

在所有域名上都应该显示正确的后端 API URL，而不是 `http://localhost:5001/api`。

