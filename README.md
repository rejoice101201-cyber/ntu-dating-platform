# 🐕 NTU Dating Platform - Pikabu 風格交友平台

一個注重內在的交友平台，透過互動解鎖照片，找到真正適合的人。

**靈感來源：Pikabu（柴犬交友）**

這是一個仿照 Pikabu 交友軟體設計的平台，強調「內在優先」的交友理念。

### ✨ 核心功能（Pikabu 風格）

1. **📸 照片模糊機制** - 照片初始為模糊狀態，需透過互動逐步解鎖（10% → 50% → 100%）
2. **🏷️ 文字/標籤自我介紹** - 豐富的標籤系統展示個性、興趣、生活方式
3. **🐕 AI 柴犬教練** - 智能聊天機器人幫助破冰、提供開場白建議、話題建議
4. **⭐ 評分配對機制** - 雙方評分總和達 7 分以上才能配對，避免無腦滑
5. **⚡ 體力系統** - 免費體力機制，每小時恢復，鼓勵認真互動
6. **🎮 問答遊戲** - 透過問答遊戲解鎖照片、提升匹配度、了解對方
7. **💬 實時聊天** - 配對後可以實時聊天，AI 柴犬協助破冰
8. **📊 解鎖進度追蹤** - 顯示與每個用戶的互動進度和照片解鎖程度

### 🚀 快速开始

#### 前置要求

- Node.js 18+
- PostgreSQL 数据库
- npm 或 yarn

#### 安装步骤

1. **安装所有依赖**
```bash
npm run install:all
```

2. **配置数据库**

创建 `.env` 文件在 `backend/` 目录：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dating_platform?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

3. **初始化数据库**

```bash
cd backend
npm run db:generate
npm run db:migrate
```

4. **启动开发服务器**

```bash
# 在项目根目录
npm run dev
```

这将同时启动：
- 前端: http://localhost:3000
- 后端: http://localhost:5000

### 📁 项目结构

```
ntu-dating-platform/
├── frontend/          # Next.js 前端应用
│   ├── app/          # Next.js App Router
│   ├── components/   # React 组件
│   ├── lib/          # 工具函数
│   └── store/        # Zustand 状态管理
├── backend/          # Node.js + Express 后端
│   ├── src/
│   │   ├── routes/   # API 路由
│   │   ├── middleware/ # 中间件
│   │   └── socket/   # WebSocket 实时通信
│   └── prisma/       # 数据库 schema
└── package.json      # 根 package.json
```

### 🛠️ 技术栈

**前端:**
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Zustand (状态管理)
- Socket.io Client (实时聊天)

**后端:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Socket.io (WebSocket)
- Sharp (图片处理)
- JWT (身份验证)

### 📝 API 文档

#### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户

#### 用户
- `GET /api/users/:id` - 获取用户资料
- `PUT /api/users/me` - 更新个人资料
- `POST /api/users/me/photos` - 上传照片
- `GET /api/users/me/energy` - 获取体力值

#### 匹配
- `GET /api/matches/discover` - 获取推荐用户
- `POST /api/matches/rate` - 评分用户
- `GET /api/matches` - 获取已匹配列表

#### 聊天
- `GET /api/chat/:matchId` - 获取聊天记录

#### 问答
- `GET /api/qa/questions` - 获取问题列表
- `POST /api/qa/answer` - 提交答案
- `POST /api/qa/play/:targetUserId` - 与用户玩问答游戏

### 🎮 使用流程（Pikabu 風格）

1. **註冊/登入** - 建立帳戶並填寫基本資訊
2. **完善資料** - 上傳照片（會自動模糊）、新增標籤、寫自我介紹
3. **探索** - 瀏覽推薦用戶，查看模糊照片和標籤
4. **評分** - 給感興趣的用戶評分（1-5 分），消耗 5 體力
5. **互動解鎖** - 透過問答遊戲解鎖對方照片，消耗 10 體力
   - 問答匹配度越高，解鎖進度越高
   - 解鎖進度影響照片清晰度
6. **配對** - 雙方評分總和達到 7 分以上即可配對
7. **聊天** - 配對後可以開始聊天，AI 柴犬會幫助破冰
   - 點擊 🐕 按鈕獲取開場白建議
   - AI 會根據共同興趣提供話題建議

### 🔒 安全特性

- JWT 身份驗證
- 密碼加密儲存 (bcrypt)
- 用戶資料驗證
- 照片審核機制（可擴展）
- 防止機器人機制（透過互動門檻）

### 🎯 Pikabu 核心設計理念

1. **內在優先** - 透過照片模糊機制，降低「只看臉」的膚淺配對
2. **認真交友** - 評分配對機制過濾不認真或隨便滑的人
3. **互動解鎖** - 必須透過問答遊戲等互動才能解鎖照片，提升投入度
4. **AI 協助** - 柴犬教練幫助不善主動開場的用戶破冰
5. **免費使用** - 體力系統免費恢復，不強制付費

### 📱 功能特性

#### ✅ 已實現
- ✅ 照片模糊與解鎖機制（基於問答匹配度）
- ✅ 豐富的標籤系統（興趣、個性、生活方式）
- ✅ 評分配對機制（雙方總分 >= 7 分）
- ✅ 問答遊戲（解鎖照片、提升匹配度）
- ✅ 實時聊天（Socket.IO）
- ✅ 體力系統（免費，每小時恢復）
- ✅ AI 柴犬教練（開場白建議、話題建議、個人資料優化建議）
- ✅ 照片上傳與管理
- ✅ 用戶資料編輯

#### 🚧 待優化/擴展
- ⏳ 照片逐步解鎖（10% → 50% → 100% 分段）
- ⏳ 推薦算法優化（基於共同興趣、距離、活躍度）
- ⏳ AI 柴犬分析聊天內容並建議改善溝通方式
- ⏳ 用戶成長系統（數據化交友表現、成就系統）
- ⏳ 30 天脫單挑戰等成就機制
- ⏳ 更豐富的問答題庫

### 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 📄 许可证

MIT License
