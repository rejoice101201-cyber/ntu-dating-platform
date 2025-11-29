# 專案狀態與架構

## 🚀 部署資訊

### Vercel 部署
- **部署連結**: https://ntu-dating-platform-oz1ziktik-socialmedias-projects-bc8a18b0.vercel.app
- **自訂網域**: https://ntu-dating-platform-kappa.vercel.app
- **GitHub Repository**: git@github.com:rejoice101201-cyber/ntu-dating-platform.git

### 環境變數狀態
- ✅ `BLOB_READ_WRITE_TOKEN` - 已設定（Vercel Blob Storage）
- ✅ `SHARP_IGNORE_GLOBAL_LIBVIPS` - 已設定
- ✅ `JWT_SECRET` - 已設定（可選）
- ⚠️ 其他環境變數需根據實際需求設定

## 📁 專案架構

```
final-project/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 認證相關頁面組
│   │   ├── signin/              # 登入頁面
│   │   │   └── page.tsx
│   │   ├── register/            # 註冊頁面（上傳照片、設定 userID）
│   │   │   └── page.tsx
│   │   ├── error/               # 錯誤頁面
│   │   │   └── page.tsx
│   │   └── layout.tsx           # 認證頁面佈局
│   ├── (main)/                   # 主要應用頁面組
│   │   ├── page.tsx             # 配對首頁（推薦清單）
│   │   ├── chat/                # 聊天室列表
│   │   │   ├── page.tsx
│   │   │   └── [chatId]/        # 聊天室內頁
│   │   │       └── page.tsx
│   │   ├── profile/             # 個人資料頁面
│   │   │   └── page.tsx
│   │   └── layout.tsx           # 主應用佈局（導航欄）
│   ├── api/                      # API 路由
│   │   ├── auth/
│   │   │   └── [...nextauth]/   # NextAuth 處理器
│   │   │       └── route.ts
│   │   ├── register/            # 註冊 API
│   │   │   └── route.ts
│   │   ├── profile/             # 個人資料 API
│   │   │   ├── route.ts         # GET, PUT
│   │   │   └── upload/          # 照片上傳
│   │   │       └── route.ts
│   │   ├── match/               # 配對 API
│   │   │   ├── recommendations/ # 推薦清單
│   │   │   │   └── route.ts
│   │   │   ├── like/            # 喜歡
│   │   │   │   └── route.ts
│   │   │   ├── pass/            # 跳過
│   │   │   │   └── route.ts
│   │   │   └── matches/         # 已配對用戶
│   │   │       └── route.ts
│   │   ├── chat/                # 聊天 API
│   │   │   ├── route.ts         # GET, POST（列表、創建）
│   │   │   ├── [chatId]/        # 聊天室操作
│   │   │   │   ├── route.ts     # GET, DELETE
│   │   │   │   └── messages/    # 訊息操作
│   │   │   │       └── route.ts # POST（發送訊息）
│   │   │   └── cleanup/         # 清理過期聊天室
│   │   │       └── route.ts
│   │   └── pusher/              # Pusher 認證
│   │       └── auth/
│   │           └── route.ts
│   ├── layout.tsx               # 根佈局（SessionProvider）
│   ├── page.tsx                 # 根頁面（重定向）
│   └── globals.css              # 全域樣式
├── components/                   # React 組件
│   ├── match/
│   │   └── MatchCard.tsx        # 配對卡片組件
│   ├── profile/                 # 個人資料組件（待擴充）
│   ├── chat/                    # 聊天組件（待擴充）
│   ├── providers/
│   │   └── SessionProvider.tsx  # NextAuth Session Provider
│   └── ui/                      # UI 組件（待擴充）
├── lib/                         # 工具函數庫
│   ├── auth.ts                  # NextAuth 配置
│   ├── db.ts                    # MongoDB 連接（Mongoose）
│   ├── pusher.ts                # Pusher 伺服器端配置
│   ├── pusher-client.ts         # Pusher 客戶端配置
│   └── utils.ts                 # 工具函數（驗證、文字處理）
├── models/                       # Mongoose Models
│   ├── User.ts                  # 用戶模型
│   ├── Chat.ts                  # 聊天室模型
│   ├── Message.ts               # 訊息模型
│   └── Match.ts                 # 配對模型
├── types/                        # TypeScript 類型定義
│   └── index.ts                 # NextAuth Session 類型擴展
├── public/                       # 靜態資源
├── auth.ts                      # NextAuth 導出
├── next.config.ts               # Next.js 配置
├── tsconfig.json                # TypeScript 配置
├── package.json                 # 專案依賴
├── vercel.json                  # Vercel 部署配置
└── .vercelignore               # Vercel 忽略檔案
```

## ✨ 已實現功能

### 1. 認證系統 ✅

#### OAuth 登入
- ✅ Google OAuth 登入
- ✅ Facebook OAuth 登入
- ✅ NextAuth.js v5 整合
- ✅ MongoDB 適配器
- ✅ Session 管理（7 天有效，24 小時滑動過期）

#### 註冊流程
- ✅ userID 註冊（1-15 字元，字母數字底線）
- ✅ userID 唯一性驗證
- ✅ 照片上傳（支援多張，最多 5 張）
- ✅ Vercel Blob Storage 整合

### 2. 個人資料系統 ✅

#### API 端點
- ✅ `GET /api/profile` - 取得個人資料
- ✅ `PUT /api/profile` - 更新個人資料
- ✅ `POST /api/profile/upload` - 上傳照片（Vercel Blob）

#### 功能
- ✅ 個人資料編輯頁面
- ✅ 照片管理（上傳、顯示）
- ✅ 標籤系統（個性、興趣、外貌）
- ✅ 基本資訊（姓名、年齡、地點、自我介紹）

### 3. 配對系統 ✅

#### API 端點
- ✅ `GET /api/match/recommendations` - 取得推薦清單
- ✅ `POST /api/match/like` - 喜歡某個用戶
- ✅ `POST /api/match/pass` - 跳過某個用戶
- ✅ `GET /api/match/matches` - 取得已配對的用戶

#### 功能
- ✅ 推薦算法（根據興趣、個性標籤匹配）
- ✅ 階段一：隱藏照片，只顯示基本資訊和標籤
- ✅ Like/Pass 功能
- ✅ 雙向匹配自動創建聊天室
- ✅ 配對卡片 UI（MatchCard 組件）

### 4. 聊天系統 ✅

#### API 端點
- ✅ `GET /api/chat` - 取得聊天室列表
- ✅ `GET /api/chat/[chatId]` - 取得聊天室詳情和訊息
- ✅ `POST /api/chat` - 創建新聊天室
- ✅ `POST /api/chat/[chatId]/messages` - 發送訊息
- ✅ `DELETE /api/chat/[chatId]` - 刪除聊天室
- ✅ `POST /api/chat/cleanup` - 清理過期聊天室（7天無對話且非朋友）

#### 功能
- ✅ 聊天室列表頁面
- ✅ 聊天室內頁 UI
- ✅ 即時訊息（Pusher 整合）
- ✅ 訊息輸入和顯示
- ✅ 最後訊息預覽（過長以 "..." 省略）
- ✅ 自動刪除邏輯（API 端點已實現，需設定 Cron Job）

### 5. UI/UX ✅

#### 設計
- ✅ Tailwind CSS 響應式設計
- ✅ 移動端優化
- ✅ 載入狀態顯示
- ✅ 錯誤處理
- ✅ 導航欄（配對、訊息、個人資料、登出）

#### 頁面
- ✅ 登入頁面（OAuth 按鈕）
- ✅ 註冊頁面（userID、照片上傳）
- ✅ 配對首頁（推薦清單）
- ✅ 聊天室列表
- ✅ 聊天室內頁
- ✅ 個人資料頁面

## 🔧 技術實現細節

### 資料庫
- **MongoDB** + **Mongoose ORM**
- 連接池管理
- 索引優化

### 認證
- **NextAuth.js v5**
- MongoDB 適配器
- JWT Session Strategy
- OAuth Provider 獨立帳號

### 檔案上傳
- **Vercel Blob Storage**
- 支援多張照片
- 公開存取 URL

### 即時通訊
- **Pusher**
- 頻道訂閱
- 用戶認證
- 即時訊息推送

### 部署
- **Vercel**
- 自動部署（GitHub 整合）
- 環境變數管理
- 自訂網域

## 📊 資料庫 Schema

### User
```typescript
{
  _id: ObjectId
  userID: String (unique, 1-15 chars)
  name: String
  email: String (unique per provider)
  originalEmail: String
  emailVerified: Date
  image: String (頭像 URL)
  photos: [String] (照片 URLs)
  bio: String
  personality: [String]
  interests: [String]
  appearance: [String]
  age: Number
  location: String
  createdAt: Date
  updatedAt: Date
}
```

### Chat
```typescript
{
  _id: ObjectId
  participants: [ObjectId] (2 users)
  createdAt: Date
  lastMessageAt: Date
  isFriend: Boolean
  status: 'active' | 'closed'
}
```

### Message
```typescript
{
  _id: ObjectId
  chatId: ObjectId
  senderId: ObjectId
  content: String
  type: 'text' | 'sticker' | 'image'
  createdAt: Date
}
```

### Match
```typescript
{
  _id: ObjectId
  userId: ObjectId
  matchedUserId: ObjectId
  status: 'pending' | 'liked' | 'passed'
  createdAt: Date
}
```

## 🚧 待完成功能

### 高優先級
- [ ] 設定完整的環境變數（MongoDB, OAuth, Pusher）
- [ ] 設定 Vercel Cron Job（自動清理聊天室）
- [ ] 測試所有功能在生產環境的運作

### 中優先級
- [ ] 優化推薦算法（更精準的匹配）
- [ ] 添加更多 UI 組件
- [ ] 實現照片編輯功能
- [ ] 添加通知系統

### 低優先級
- [ ] 實現階段二（配對成功後顯示完整照片）
- [ ] 添加更多標籤選項
- [ ] 實現搜尋功能
- [ ] 添加管理後台

## 📝 環境變數需求

### 已設定
- ✅ `BLOB_READ_WRITE_TOKEN`
- ✅ `SHARP_IGNORE_GLOBAL_LIBVIPS`
- ✅ `JWT_SECRET` (可選)

### 需要設定
- ⚠️ `MONGODB_URI` - MongoDB 連接字串
- ⚠️ `NEXTAUTH_URL` - 應設為 `https://ntu-dating-platform-kappa.vercel.app`
- ⚠️ `AUTH_SECRET` - NextAuth 密鑰
- ⚠️ `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- ⚠️ `FACEBOOK_ID` / `FACEBOOK_SECRET`
- ⚠️ `NEXT_PUBLIC_PUSHER_APP_KEY` / `PUSHER_APP_ID` / `PUSHER_SECRET` / `NEXT_PUBLIC_PUSHER_CLUSTER`

## 🔗 相關文檔

- `README.md` - 專案說明
- `VERCEL_DEPLOYMENT.md` - Vercel 部署指南
- `DEPLOYMENT_CHECKLIST.md` - 部署檢查清單
- `COLLABORATOR_SETUP.md` - 協作者設定指南
- `ENV_VARIABLES.md` - 環境變數說明

## 📞 聯絡資訊

- **GitHub**: git@github.com:rejoice101201-cyber/ntu-dating-platform.git
- **Vercel**: https://vercel.com/dashboard




