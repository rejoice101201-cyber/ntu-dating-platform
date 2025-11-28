# 🚀 本地快速测试指南（不需要部署后端！）

## ✅ 好消息！

你的项目使用 **SQLite** 数据库，不需要安装 PostgreSQL，可以直接在本地运行测试！

## ⚡ 5 分钟快速启动

### 步骤 1: 检查环境变量

确保 `backend/.env` 文件存在：

```bash
# 检查文件是否存在
ls backend/.env
```

如果不存在，创建它：

```bash
cd backend
cat > .env << EOF
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-for-local-testing"
PORT=5001
FRONTEND_URL="http://localhost:3000"
EOF
```

### 步骤 2: 检查前端环境变量

确保 `frontend/.env.local` 文件存在：

```bash
# 检查文件是否存在
ls frontend/.env.local
```

如果不存在，创建它：

```bash
cd frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5001/api
EOF
```

### 步骤 3: 初始化数据库

```bash
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:create-bots
npm run db:create-match
```

### 步骤 4: 启动本地服务器

在项目根目录运行：

```bash
npm run dev
```

这会同时启动：
- ✅ 前端: http://localhost:3000
- ✅ 后端: http://localhost:5001

### 步骤 5: 测试！

1. 打开浏览器访问：http://localhost:3000
2. 注册新账户或登录
3. 开始测试所有功能！

---

## 🎯 可以测试的功能

### ✅ 完全可用（不需要部署）

- ✅ 用户注册/登录
- ✅ 个人资料管理
- ✅ 照片上传
- ✅ 标签系统
- ✅ 探索/推荐用户
- ✅ 评分功能
- ✅ 问答游戏
- ✅ 照片解锁
- ✅ 实时聊天（Socket.IO）
- ✅ 体力系统
- ✅ AI 柴犬教练

**所有功能都可以在本地测试！**

---

## 🔧 如果遇到问题

### 问题 1: 端口被占用

如果 5001 端口被占用，修改 `backend/.env`：

```env
PORT=5002
```

然后修改 `frontend/.env.local`：

```env
NEXT_PUBLIC_API_URL=http://localhost:5002/api
```

### 问题 2: 数据库错误

重置数据库：

```bash
cd backend
rm prisma/dev.db prisma/dev.db-journal
npm run db:migrate
npm run db:seed
npm run db:create-bots
npm run db:create-match
```

### 问题 3: 依赖未安装

```bash
npm run install:all
```

---

## 📋 快速检查清单

- [ ] `backend/.env` 文件存在
- [ ] `frontend/.env.local` 文件存在
- [ ] 数据库已初始化（`npm run db:migrate`）
- [ ] 已创建测试数据（`npm run db:seed` 和 `db:create-bots`）
- [ ] 本地服务器正在运行（`npm run dev`）
- [ ] 浏览器可以访问 http://localhost:3000

---

## 💡 本地测试的优势

1. **快速** - 不需要部署，立即测试
2. **免费** - 不需要任何云服务
3. **完整功能** - 所有功能都可以测试
4. **调试方便** - 可以直接查看日志和数据库
5. **离线可用** - 不需要网络连接

---

## 🚀 测试完成后

当你测试满意后，再考虑部署到 Render 或其他平台。

**本地测试 → 确认功能正常 → 部署到生产环境**

这是最佳的工作流程！

---

## 📝 常用命令

```bash
# 启动开发服务器（前端 + 后端）
npm run dev

# 只启动前端
npm run dev:frontend

# 只启动后端
npm run dev:backend

# 查看数据库（Prisma Studio）
cd backend
npm run db:studio

# 重置数据库
cd backend
rm prisma/dev.db*
npm run db:migrate
npm run db:seed
npm run db:create-bots
```

---

## ✅ 总结

**不需要部署后端就可以测试！**

1. 配置环境变量（2 分钟）
2. 初始化数据库（1 分钟）
3. 启动服务器（`npm run dev`）
4. 开始测试！

所有功能都可以在本地完整测试！

