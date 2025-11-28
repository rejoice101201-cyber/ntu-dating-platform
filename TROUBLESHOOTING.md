# 故障排除指南

## 页面显示空白

如果页面显示空白，请尝试以下步骤：

### 1. 清除浏览器缓存
- Chrome/Edge: `Ctrl+Shift+Delete` (Windows) 或 `Cmd+Shift+Delete` (Mac)
- 选择"缓存的图片和文件"
- 清除后刷新页面 (`Ctrl+F5` 或 `Cmd+Shift+R`)

### 2. 检查浏览器控制台
- 按 `F12` 打开开发者工具
- 查看 Console 标签页是否有错误
- 查看 Network 标签页，确认资源是否加载成功

### 3. 确认服务器运行状态

```bash
# 检查前端 (端口 3000)
curl http://localhost:3000

# 检查后端 (端口 5000)
curl http://localhost:5000/api/health
```

### 4. 重新启动服务器

```bash
# 停止所有进程
pkill -f "next dev"
pkill -f "tsx watch"

# 重新启动
cd /Users/caimanxuan/ntu-dating-platform
npm run dev
```

### 5. 检查环境变量

确保以下文件存在：
- `backend/.env` - 包含数据库配置
- `frontend/.env.local` - 包含 API URL

### 6. 检查数据库

```bash
cd backend
npm run db:migrate
npm run db:seed
```

## 注册失败

### 常见错误

1. **"Registration failed"**
   - 检查后端日志
   - 确认数据库已初始化
   - 检查 `.env` 文件配置

2. **网络错误**
   - 确认后端服务器运行在 `http://localhost:5000`
   - 检查 `frontend/.env.local` 中的 `NEXT_PUBLIC_API_URL`

3. **数据库连接错误**
   - 确认 SQLite 数据库文件存在: `backend/prisma/dev.db`
   - 运行 `npm run db:migrate` 重新初始化

## 快速修复

如果所有方法都无效，尝试完全重置：

```bash
# 1. 停止所有进程
pkill -f "next"
pkill -f "tsx"
pkill -f "node"

# 2. 清理缓存
cd frontend
rm -rf .next node_modules
cd ../backend
rm -rf node_modules prisma/dev.db*

# 3. 重新安装
cd ..
npm run install:all

# 4. 初始化数据库
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed

# 5. 启动服务器
cd ..
npm run dev
```

