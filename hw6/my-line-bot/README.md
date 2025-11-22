# Line Bot AI 助手

這是一個整合 Line Bot 與 Google Gemini API 的 Next.js 專案。

## 功能特色

- ✅ Line Bot Webhook 整合
- ✅ Google Gemini Pro 對話功能
- ✅ 自動回覆使用者訊息
- ✅ 部署到 Vercel

## 本地開發

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env.local` 並填入您的金鑰：

```bash
cp .env.example .env.local
```

編輯 `.env.local` 並填入：
- `CHANNEL_ACCESS_TOKEN`: Line Bot Channel Access Token
- `CHANNEL_SECRET`: Line Bot Channel Secret
- `GEMINI_API_KEY`: Google Gemini API Key
- `POSTGRES_URL`: 資料庫連接字串（可選）
- `PRISMA_DATABASE_URL`: Prisma 資料庫連接字串（可選）

### 3. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

## 部署到 Vercel

### 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. 在 Vercel 部署

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "Add New..." -> "Project"
3. 匯入您的 GitHub Repository
4. 在 "Environment Variables" 區域設定以下變數：
   - `CHANNEL_ACCESS_TOKEN`
   - `CHANNEL_SECRET`
   - `GEMINI_API_KEY`
   - `POSTGRES_URL`（如使用 Vercel Postgres）
   - `PRISMA_DATABASE_URL`（如使用 Vercel Postgres）
5. 點擊 "Deploy"

### 3. 設定 Line Webhook

部署完成後，在 Line Developers Console 中：

1. 前往您的 Channel 設定
2. 進入 "Messaging API" 分頁
3. 在 "Webhook URL" 欄位填入：`https://hw6-bot.vercel.app/api/webhooks/line`
   - **注意**：路徑是 `/api/webhooks/line`（webhooks 是複數）
4. 啟用 Webhook
5. 驗證 Webhook（點擊 "Verify" 按鈕）

**重要提醒**：
- Webhook URL 必須是 HTTPS
- 路徑必須是 `/api/webhooks/line`（不是 `/api/webhook/line`）
- 如果驗證失敗，請檢查 Vercel 部署狀態和環境變數設定

## 專案結構

```
my-line-bot/
├── app/
│   ├── api/
│   │   └── webhook/
│   │       └── route.ts    # Line Bot webhook 處理
│   ├── page.tsx            # 首頁
│   └── layout.tsx
├── .env.local              # 環境變數（本地，不提交到 Git）
├── .env.example            # 環境變數範本
├── vercel.json             # Vercel 配置
└── package.json
```

## 技術棧

- [Next.js](https://nextjs.org) - React 框架
- [Line Bot SDK](https://github.com/line/line-bot-sdk-nodejs) - Line Bot 官方 SDK
- [Google Gemini API](https://ai.google.dev) - AI 對話功能
- [TypeScript](https://www.typescriptlang.org) - 型別安全
- [Tailwind CSS](https://tailwindcss.com) - 樣式框架

## 注意事項

- 確保 `.env.local` 檔案已加入 `.gitignore`（預設已包含）
- Webhook URL 必須是 HTTPS
- Google Gemini API 有免費額度，請注意使用量
- 建議在生產環境中實作錯誤處理和日誌記錄
