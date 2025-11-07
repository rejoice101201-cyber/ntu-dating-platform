# X-like 社群網站

一個類似 Twitter/X 的社群網站，使用 Next.js 全端框架開發。

## 功能特性

### 基本功能
- ✅ OAuth 登入（Google/GitHub/Facebook）
- ✅ UserID 註冊系統
- ✅ Session 管理（30 天有效）
- ✅ 主選單側邊欄（首頁、個人資料、發文）
- ✅ 個人資料頁面（可編輯/只讀）
- ✅ 發文功能（280 字元限制，連結 23 字元，Hashtag/Mention 不計入）
- ✅ 文章列表（全部/追蹤中）
- ✅ 文章互動（留言、轉發、按讚）
- ✅ 遞迴式留言系統
- ✅ 即時更新（Pusher）

### 進階功能（待實作）
- ⏳ Explore 頁面與推薦引擎
- ⏳ Notification 系統
- ⏳ New post notice
- ⏳ Hashtag 完整支援
- ⏳ 多媒體/長文章支援

## 技術棧

- **框架**: Next.js 16 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **認證**: NextAuth.js v5
- **資料庫**: PostgreSQL + Prisma ORM
- **即時通訊**: Pusher
- **部署**: Vercel

## 設置步驟

### 1. 安裝依賴

```bash
npm install
```

### 2. 設置環境變數

創建 `.env.local` 檔案：

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/twitter_clone?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

FACEBOOK_ID="your-facebook-app-id"
FACEBOOK_SECRET="your-facebook-app-secret"

# Pusher
NEXT_PUBLIC_PUSHER_APP_KEY="your-pusher-app-key"
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_SECRET="your-pusher-secret"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
```

### 3. 配置 OAuth Redirect URIs

在設置環境變數後，你需要在各個 OAuth provider 的後台配置正確的 redirect URI：

#### Google OAuth
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的專案 → **API 和服務** → **憑證**
3. 編輯你的 OAuth 2.0 用戶端 ID
4. 在 **已授權的重新導向 URI** 中添加：
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. 在 **已授權的 JavaScript 來源** 中添加：
   ```
   http://localhost:3000
   ```
6. 儲存變更

#### GitHub OAuth
1. 前往 [GitHub Developer Settings](https://github.com/settings/developers)
2. 選擇你的 OAuth App
3. 在 **Authorization callback URL** 中設置：
   ```
   http://localhost:3000/api/auth/callback/github
   ```
4. 儲存變更

#### Facebook OAuth
1. 前往 [Facebook Developers](https://developers.facebook.com/)
2. 選擇你的應用程式
3. 前往 **Facebook Login** → **Settings**
4. 在 **Valid OAuth Redirect URIs** 中添加：
   ```
   http://localhost:3000/api/auth/callback/facebook
   ```
5. 儲存變更

**重要**：如果遇到 `redirect_uri_mismatch` 錯誤，請確認：
- Redirect URI 完全匹配（包括 `http://` 或 `https://`）
- 沒有多餘的斜線或空格
- 如果使用生產環境，請同時添加生產環境的 URL

### 4. 設置資料庫

```bash
# 運行 Prisma migrations
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate
```

### 5. 運行開發伺服器

```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000)

## 專案結構

```
hw5/
├── app/
│   ├── (auth)/              # 認證相關頁面
│   │   ├── signin/
│   │   └── register/
│   ├── (main)/              # 主要應用頁面
│   │   ├── page.tsx         # 首頁
│   │   ├── profile/[userId]/
│   │   ├── post/[postId]/
│   │   └── layout.tsx       # 主選單側邊欄
│   ├── api/                  # API 路由
│   │   ├── auth/
│   │   ├── posts/
│   │   ├── likes/
│   │   ├── reposts/
│   │   └── profile/
│   └── layout.tsx
├── components/               # React 組件
│   ├── sidebar/
│   ├── post/
│   ├── profile/
│   └── providers/
├── lib/                      # 工具函數
│   ├── auth.ts               # NextAuth 配置
│   ├── db.ts                 # Prisma Client
│   ├── pusher.ts             # Pusher 配置
│   └── utils.ts              # 工具函數
├── prisma/
│   └── schema.prisma        # 資料庫 schema
└── types/                    # TypeScript 類型定義
```

## 資料庫 Schema

主要資料表：
- `User` - 使用者資訊
- `Post` - 文章（支援遞迴留言）
- `Like` - 按讚記錄
- `Repost` - 轉發記錄
- `Follow` - 追蹤關係
- `Draft` - 草稿

## UserID 規則

- 長度：1-15 字元
- 字元：僅允許字母、數字和底線
- 每個 OAuth provider 對應不同的 userID

### 列出所有 UserID

有兩種方式可以查看所有已註冊的 userID：

#### 方法 1：使用腳本（推薦）

```bash
npm run list-userids
```

這會顯示所有 userID 及其對應的 OAuth provider、名稱、email 和註冊時間。

#### 方法 2：使用 API

如果開發伺服器正在運行，可以訪問：

```
http://localhost:3000/api/users/list
```

這會返回 JSON 格式的所有用戶資料。

## 發文規則

- 總長度限制：280 字元
- 連結：每個連結佔用 23 字元
- Hashtag (#hashtag)：不計入字元數
- Mention (@mention)：不計入字元數

## 部署到 Vercel

1. 連接 GitHub repository 到 Vercel
2. 設置環境變數
3. 設置 PostgreSQL 資料庫（建議使用 Vercel Postgres 或 Supabase）
4. 運行 migrations：`npx prisma migrate deploy`
5. 部署！

## 開發注意事項

- 使用 TypeScript 確保類型安全
- 所有 API 路由都需要認證（除了公開的貼文列表）
- 使用 Prisma 進行資料庫操作
- Pusher 用於即時更新按讚和留言數

## License

MIT
