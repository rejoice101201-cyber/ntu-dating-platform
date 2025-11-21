# Pikabu 約會網站

一個類似 Pikabu 的約會網站，支援 OAuth 登入、用戶配對、即時聊天等功能。

## 技術棧

- **框架**: Next.js 16 (App Router)
- **語言**: TypeScript
- **認證**: NextAuth.js v5 (Google, Facebook OAuth)
- **資料庫**: MongoDB + Mongoose ORM
- **即時通訊**: Pusher
- **樣式**: Tailwind CSS
- **部署**: Vercel

## 功能特色

- ✅ OAuth 登入系統（Google, Facebook）
- ✅ 用戶註冊（userID、照片上傳）
- ✅ 配對系統（階段一隱藏照片）
- ✅ 即時聊天（Pusher）
- ✅ 個人資料管理
- ✅ 自動清理聊天室（7天無對話且非朋友）

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

創建 `.env.local` 檔案：

```env
# Database
MONGODB_URI="mongodb://localhost:27017/pikabu?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

FACEBOOK_ID="your-facebook-app-id"
FACEBOOK_SECRET="your-facebook-app-secret"

# Pusher
NEXT_PUBLIC_PUSHER_APP_KEY="your-pusher-app-key"
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_SECRET="your-pusher-secret"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
```

### 3. 運行開發伺服器

```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000)

## 部署到 Vercel

### 快速開始（不設定環境變數）

如果您想先讓協作者看到專案，可以：

1. 連接 GitHub Repository 到 Vercel
2. 直接點擊 Deploy（使用預設值）
3. 專案會構建成功，但功能會受限

詳細說明請參考 `COLLABORATOR_SETUP.md`

### 完整部署（設定環境變數）

詳細的部署步驟請參考：
- `VERCEL_DEPLOYMENT.md` - 完整部署指南
- `DEPLOYMENT_CHECKLIST.md` - 部署檢查清單

### 邀請協作者

1. 在 Vercel Dashboard → Settings → Team/Members
2. 點擊 "Invite Member"
3. 輸入協作者的 email
4. 選擇權限級別（推薦：Developer）
5. 發送邀請

詳細說明請參考 `COLLABORATOR_SETUP.md`

## 專案結構

```
final-project/
├── app/
│   ├── (auth)/              # 認證相關頁面
│   ├── (main)/              # 主要應用頁面
│   └── api/                 # API 路由
├── components/              # React 組件
├── lib/                     # 工具函數
├── models/                  # Mongoose Models
└── types/                   # TypeScript 類型定義
```

## API 端點

### 認證
- `POST /api/auth/[...nextauth]` - NextAuth 處理器
- `POST /api/register` - 註冊

### 個人資料
- `GET /api/profile` - 取得個人資料
- `PUT /api/profile` - 更新個人資料
- `POST /api/profile/upload` - 上傳照片

### 配對
- `GET /api/match/recommendations` - 取得推薦清單
- `POST /api/match/like` - 喜歡某個用戶
- `POST /api/match/pass` - 跳過某個用戶
- `GET /api/match/matches` - 取得已配對的用戶

### 聊天
- `GET /api/chat` - 取得聊天室列表
- `GET /api/chat/[chatId]` - 取得聊天室詳情
- `POST /api/chat` - 創建新聊天室
- `POST /api/chat/[chatId]/messages` - 發送訊息
- `POST /api/chat/cleanup` - 清理過期聊天室

## 資料庫 Schema

### User
- userID, name, email, photos, bio
- personality, interests, appearance
- age, location

### Chat
- participants, createdAt, lastMessageAt
- isFriend, status

### Message
- chatId, senderId, content, type
- createdAt

### Match
- userId, matchedUserId, status
- createdAt

## 授權

MIT
