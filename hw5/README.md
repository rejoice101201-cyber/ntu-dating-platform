# 🐦 X-like 社群網站 (Twitter Clone)

一個功能完整的類似 Twitter/X 的社群網站，使用 Next.js 全端框架開發，支援 OAuth 登入、即時更新、通知系統等進階功能。

---

## 🚀 **Deployed Link**

### **👉 [https://wp1141-azure.vercel.app](https://wp1141-azure.vercel.app) 👈**

**重要提示**：請使用上述連結訪問部署的應用程式。

---

## ✨ 功能清單

### 基本功能

- ✅ **OAuth 登入系統**
  - 支援 Google、GitHub、Facebook 三種 OAuth 提供者
  - 每個 OAuth provider 對應獨立的用戶帳號
  - Session 管理（7 天有效，24 小時滑動過期）

- ✅ **UserID 註冊系統**
  - 自訂 userID（1-15 字元，字母、數字、底線）
  - 每個 OAuth provider 可註冊不同的 userID

- ✅ **完整的側邊欄導航**
  - Home（首頁）
  - Explore（探索，UI 已完成）
  - Notifications（通知，帶未讀數量徽章）
  - Messages（訊息，UI 已完成）
  - Grok、Lists、Bookmarks、Communities、Premium、More（UI 已完成）
  - Profile（個人資料）
  - Post（發文按鈕）

- ✅ **發文功能**
  - 280 字元限制（符合 Twitter 規則）
  - 連結自動縮短為 23 字元計算
  - Hashtag (#hashtag) 不計入字元數
  - Mention (@mention) 不計入字元數
  - 支援連結、Hashtag、Mention 自動識別和點擊

- ✅ **文章互動**
  - 按讚（Like）
  - 轉發（Repost）
  - 留言（Comment）
  - 遞迴式留言系統（支援多層嵌套）

- ✅ **個人資料頁面**
  - 可編輯個人資料（自己的 profile）
  - 查看他人資料（只讀模式）
  - 顯示追蹤者/追蹤中數量
  - 顯示文章數、按讚數
  - Posts 和 Likes 標籤切換

- ✅ **文章列表**
  - 全部文章（All）
  - 追蹤中（Following）
  - 即時更新（Pusher）

### 🎯 進階功能

- ✅ **通知系統 (Notifications)**
  - 顯示所有通知：repost、like post、like comment
  - 側邊欄顯示未讀通知數量（紅色徽章）
  - 通知列表頁面顯示詳細資訊
  - 每個通知包含：用戶頭像、名稱、通知類型、post 預覽、時間
  - 點擊通知可導航到對應的 post

- ✅ **New Post Notice（新文章通知）**
  - 當你追蹤的用戶發布新文章時，在 feed 上方顯示通知
  - 顯示前三個用戶的頭像
  - 顯示 "posted" 文字和用戶名稱
  - 支援 "Show" 按鈕立即顯示新文章
  - 支援自動在 10 秒後顯示新文章

- ✅ **即時更新 (Real-time Updates)**
  - 使用 Pusher 實現即時更新
  - 按讚數即時更新
  - 轉發數即時更新
  - 新文章即時推送
  - 無需刷新頁面即可看到最新內容

- ✅ **遞迴式留言系統**
  - 支援多層嵌套留言
  - 每個留言可以有自己的子留言
  - 無限層級支援
  - 清晰的視覺層級顯示

- ✅ **追蹤系統**
  - 追蹤/取消追蹤用戶
  - 顯示追蹤者列表
  - 顯示追蹤中列表
  - Following feed 過濾

- ✅ **草稿功能**
  - 自動儲存草稿
  - 恢復草稿功能

---

## 🏗️ 架構圖

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Next.js    │  │   React      │  │  Tailwind CSS │         │
│  │  App Router  │  │  Components  │  │   Styling    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                 │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                    Next.js Server (Vercel)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API Routes (App Router)                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │  │
│  │  │  Auth   │  │  Posts   │  │  Likes   │  │ Follow   │ │  │
│  │  │  API    │  │  API     │  │  API     │  │  API     │ │  │
│  │  │         │  │          │  │          │  │          │ │  │
│  │  └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │  │
│  │       │            │              │              │        │  │
│  │       └────────────┼──────────────┼──────────────┘        │  │
│  │                    │              │                        │  │
│  │              ┌─────▼──────────────▼─────┐                │  │
│  │              │   Notifications API       │                │  │
│  │              └──────────────────────────┘                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              NextAuth.js v5                               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│  │  │ Google   │  │  GitHub  │  │ Facebook │              │  │
│  │  │ OAuth    │  │  OAuth   │  │  OAuth   │              │  │
│  │  └──────────┘  └──────────┘  └──────────┘              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Prisma ORM                                   │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         │ SQL Queries
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    PostgreSQL Database                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Users   │  │  Posts   │  │  Likes   │  │ Reposts  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ Follows  │  │ Comments │  │ Drafts   │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ WebSocket
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    Pusher (Real-time)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │  Like    │  │  Repost  │  │ New Post │                     │
│  │  Events  │  │  Events  │  │  Events  │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

### 架構說明

1. **前端層 (Client)**
   - Next.js App Router 處理路由和 SSR
   - React Components 構建 UI
   - Tailwind CSS 提供樣式

2. **後端層 (Server)**
   - Next.js API Routes 處理業務邏輯
   - NextAuth.js 處理認證
   - Prisma ORM 處理資料庫操作

3. **資料層 (Database)**
   - PostgreSQL 儲存所有資料
   - Prisma 提供類型安全的資料庫訪問

4. **即時通訊層 (Real-time)**
   - Pusher 提供 WebSocket 連接
   - 實現即時更新功能

---

## 🛠️ 技術棧

- **框架**: Next.js 16 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **認證**: NextAuth.js v5
- **資料庫**: PostgreSQL + Prisma ORM
- **即時通訊**: Pusher
- **部署**: Vercel

---

## 📦 快速開始

### 方式一：直接使用部署版本（推薦）

1. **訪問部署連結**：https://wp1141-azure.vercel.app
2. **使用 OAuth 登入**（Google/GitHub/Facebook）
3. **完成 userID 註冊**
4. **開始使用！**

### 方式二：本地開發環境

#### 1. 克隆專案

```bash
git clone https://github.com/rejoice101201-cyber/wp1141.git
cd wp1141/hw5
```

#### 2. 安裝依賴

```bash
npm install
```

#### 3. 設置環境變數

創建 `.env.local` 檔案：

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/twitter_clone?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="your-secret-key-here-change-in-production"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

FACEBOOK_ID="your-facebook-app-id"
FACEBOOK_SECRET="your-facebook-app-secret"

# Pusher (可選，用於即時更新)
NEXT_PUBLIC_PUSHER_APP_KEY="your-pusher-app-key"
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_SECRET="your-pusher-secret"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
```

#### 4. 配置 OAuth Redirect URIs

**Google OAuth**：
- 前往 [Google Cloud Console](https://console.cloud.google.com/)
- 添加 Redirect URI: `http://localhost:3000/api/auth/callback/google`
- 添加 JavaScript 來源: `http://localhost:3000`

**GitHub OAuth**：
- 前往 [GitHub Developer Settings](https://github.com/settings/developers)
- 設置 Callback URL: `http://localhost:3000/api/auth/callback/github`

**Facebook OAuth**：
- 前往 [Facebook Developers](https://developers.facebook.com/)
- 添加 Redirect URI: `http://localhost:3000/api/auth/callback/facebook`

#### 5. 設置資料庫

```bash
# 運行 Prisma migrations
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate
```

#### 6. 運行開發伺服器

```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000)

---

## 📝 專案結構

```
hw5/
├── app/
│   ├── (auth)/              # 認證相關頁面
│   │   ├── signin/         # 登入頁面
│   │   └── register/       # 註冊頁面
│   ├── (main)/              # 主要應用頁面
│   │   ├── page.tsx        # 首頁
│   │   ├── notifications/   # 通知頁面
│   │   ├── profile/[userId]/ # 個人資料頁面
│   │   ├── post/[postId]/  # 文章詳情頁面
│   │   └── layout.tsx      # 主選單側邊欄
│   ├── api/                 # API 路由
│   │   ├── auth/           # 認證 API
│   │   ├── posts/          # 文章 API
│   │   ├── likes/          # 按讚 API
│   │   ├── reposts/        # 轉發 API
│   │   ├── follow/         # 追蹤 API
│   │   ├── notifications/  # 通知 API
│   │   └── profile/        # 個人資料 API
│   └── layout.tsx
├── components/              # React 組件
│   ├── sidebar/            # 側邊欄組件
│   ├── post/               # 文章相關組件
│   ├── profile/            # 個人資料組件
│   ├── notifications/      # 通知組件
│   └── providers/          # Context Providers
├── lib/                     # 工具函數
│   ├── auth.ts             # NextAuth 配置
│   ├── db.ts               # Prisma Client
│   ├── pusher.ts           # Pusher 配置
│   └── utils.ts            # 工具函數
├── prisma/
│   └── schema.prisma       # 資料庫 schema
└── types/                  # TypeScript 類型定義
```

---

## 🗄️ 資料庫 Schema

主要資料表：

- `User` - 使用者資訊（包含 userID、name、email、image、bio、banner）
- `Post` - 文章（支援遞迴留言 via parentId）
- `Like` - 按讚記錄
- `Repost` - 轉發記錄
- `Follow` - 追蹤關係
- `Draft` - 草稿
- `Account` - OAuth 帳號連結
- `Session` - 使用者 Session

---

## 📋 使用說明

### UserID 規則

- 長度：1-15 字元
- 字元：僅允許字母、數字和底線（a-z, A-Z, 0-9, _）
- 每個 OAuth provider 對應不同的 userID
- userID 必須唯一

### 發文規則

- 總長度限制：280 字元
- 連結：每個連結佔用 23 字元（符合 Twitter 規則）
- Hashtag (#hashtag)：不計入字元數
- Mention (@mention)：不計入字元數

### 通知系統

- 當有人 repost 你的文章時，會收到通知
- 當有人 like 你的 post 時，會收到通知
- 當有人 like 你的留言時，會收到通知
- 通知數量顯示在側邊欄的 Notifications 圖標上

### New Post Notice

- 當你追蹤的用戶發布新文章時，會在 feed 上方顯示通知
- 顯示前三個用戶的頭像和名稱
- 點擊 "Show" 按鈕可立即顯示新文章
- 或等待 10 秒自動顯示

---

## 🚀 部署到 Vercel

### 步驟 1：連接 GitHub Repository

1. 登入 [Vercel](https://vercel.com)
2. 點擊 "New Project"
3. 選擇你的 GitHub repository
4. 選擇 `hw5` 目錄作為 Root Directory

### 步驟 2：設置環境變數

在 Vercel Dashboard → Settings → Environment Variables 中添加：

```env
DATABASE_URL=你的資料庫連接字串
AUTH_SECRET=你的認證密鑰
NEXTAUTH_URL=https://wp1141-azure.vercel.app
GOOGLE_CLIENT_ID=你的Google Client ID
GOOGLE_CLIENT_SECRET=你的Google Client Secret
GITHUB_ID=你的GitHub Client ID
GITHUB_SECRET=你的GitHub Client Secret
FACEBOOK_ID=你的Facebook App ID
FACEBOOK_SECRET=你的Facebook App Secret
NEXT_PUBLIC_PUSHER_APP_KEY=你的Pusher App Key
PUSHER_APP_ID=你的Pusher App ID
PUSHER_SECRET=你的Pusher Secret
NEXT_PUBLIC_PUSHER_CLUSTER=你的Pusher Cluster
```

### 步驟 3：配置 OAuth Redirect URIs

**Google OAuth**：
- Redirect URI: `https://wp1141-azure.vercel.app/api/auth/callback/google`
- JavaScript 來源: `https://wp1141-azure.vercel.app`

**GitHub OAuth**：
- Callback URL: `https://wp1141-azure.vercel.app/api/auth/callback/github`

**Facebook OAuth**：
- Redirect URI: `https://wp1141-azure.vercel.app/api/auth/callback/facebook`

### 步驟 4：運行 Migrations

在 Vercel Dashboard → Settings → Build & Development Settings 中，添加 Build Command：

```bash
npx prisma generate && npx prisma migrate deploy && npm run build
```

### 步驟 5：部署

點擊 "Deploy" 按鈕，等待部署完成！

詳細的 OAuth 設定指南請參考 `VERCEL_OAUTH_SETUP.md`。

---

## 🧪 測試提示

### 測試 OAuth 登入

1. 使用不同的 OAuth provider 登入（Google/GitHub/Facebook）
2. 每個 provider 會創建獨立的用戶帳號
3. 即使使用相同的 email，不同 provider 的帳號也是分開的

### 測試通知系統

1. 使用一個帳號發布文章
2. 使用另一個帳號按讚或轉發
3. 回到第一個帳號，檢查通知數量是否更新
4. 訪問 `/notifications` 頁面查看詳細通知

### 測試 New Post Notice

1. 使用帳號 A 追蹤帳號 B
2. 使用帳號 B 發布新文章
3. 在帳號 A 的首頁，應該會看到 New Post Notice
4. 點擊 "Show" 按鈕或等待 10 秒自動顯示

---

## 📚 相關文檔

- `VERCEL_OAUTH_SETUP.md` - Vercel 部署 OAuth 設定詳細指南
- `OAUTH_FIX.md` - OAuth 登入錯誤修復指南
- `DEBUG.md` - OAuth 登入 Debug 指南

---

## 🐛 常見問題

### Q: 為什麼登入後顯示 "Configuration" 錯誤？

**A**: 請確認：
1. 所有環境變數都已正確設置
2. OAuth Redirect URI 已正確配置
3. `NEXTAUTH_URL` 環境變數已設置
4. 已重新部署應用程式

### Q: 為什麼通知數量不更新？

**A**: 通知數量每 30 秒自動更新一次。如果還是沒有更新，請：
1. 刷新頁面
2. 檢查瀏覽器控制台是否有錯誤
3. 確認 `/api/notifications/count` API 正常運作

### Q: 為什麼 New Post Notice 沒有顯示？

**A**: 請確認：
1. 你已經追蹤了發布文章的用戶
2. Pusher 配置正確
3. 瀏覽器控制台沒有錯誤訊息

---

## 📄 License

MIT

---

## 👤 作者

WP1141 作業 5 - X-like 社群網站

---

**再次提醒：Deployed Link 為 [https://wp1141-azure.vercel.app](https://wp1141-azure.vercel.app)**
