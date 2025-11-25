# 木木日安醫學美容診所 Line Bot

這是一個整合 Line Bot 與 Google Gemini API 的 Next.js 專案，為木木日安醫學美容診所（復興館）提供智能客服服務。

## 📋 繳交內容

### 1. 部署連結

#### LINE Bot
- **LINE Bot URL**: [https://line.me/R/ti/p/@335qqqlp](https://line.me/R/ti/p/@335qqqlp)
- **QR Code**: 請使用 LINE 應用程式掃描以下 QR Code 或直接點擊上方連結

```
請在 LINE 應用程式中搜尋：@335qqqlp
或訪問：https://line.me/R/ti/p/@335qqqlp
```

#### 管理後台
- **Production URL**: [https://hw6-bot.vercel.app/admin](https://hw6-bot.vercel.app/admin)
- **功能說明**：
  - 無需登入，可直接訪問
  - 查看所有對話記錄和訊息
  - 系統狀態監控（健康檢查、效能監控）
  - 進階搜尋功能

### 2. 對話/功能設計

詳細的對話流程與功能設計請參考：[chatbot-design.md](../chatbot-design.md)

### 3. 原始碼

- **GitHub 倉庫**: `rejoice101201-cyber/wp1141`
- **專案路徑**: `hw6/my-line-bot/`
- **完整可讀程式碼**：已上傳至 GitHub，確認未包含敏感資訊（`.env`、密鑰、logs 等）

## 🚀 快速開始

### 使用 Vercel Deploy Button（推薦）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rejoice101201-cyber/wp1141&root-directory=hw6%2Fmy-line-bot)

1. 點擊上方 "Deploy" 按鈕
2. 連接您的 GitHub 帳號
3. 在 Vercel 專案設定中配置環境變數（見下方「環境變數設定」）
4. 點擊 "Deploy" 完成部署

### 本地開發

#### 1. 安裝依賴

```bash
cd my-line-bot
npm install
```

#### 2. 設定環境變數

複製 `.env.example` 為 `.env.local`：

```bash
cp .env.example .env.local
```

編輯 `.env.local` 並填入以下環境變數：

```env
# Line Bot 設定
LINE_CHANNEL_ACCESS_TOKEN=你的_LINE_CHANNEL_ACCESS_TOKEN
LINE_CHANNEL_SECRET=你的_LINE_CHANNEL_SECRET

# Gemini API 設定
GEMINI_API_KEY=你的_GEMINI_API_KEY

# 資料庫設定（可選，本地開發時可使用本地資料庫）
DATABASE_URL=postgresql://user:password@localhost:5432/mydb?sslmode=require
POSTGRES_URL=postgresql://user:password@localhost:5432/mydb?sslmode=require
```

#### 3. 初始化資料庫

```bash
# 生成 Prisma Client
npm run db:generate

# 推送資料庫 Schema（如果使用本地資料庫）
npm run db:push
```

#### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

#### 5. 設定 Line Webhook（本地開發）

使用 ngrok 或其他隧道工具：

```bash
# 安裝 ngrok
npm install -g ngrok

# 啟動隧道
ngrok http 3000
```

在 Line Developers Console 中設定 Webhook URL 為 ngrok 提供的 HTTPS URL。

## 🌐 部署到 Vercel

### 方法 1：使用 Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 部署到生產環境
cd my-line-bot
vercel --prod
```

### 方法 2：連接 GitHub 倉庫

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "Add New Project"
3. 選擇 GitHub 倉庫 `rejoice101201-cyber/wp1141`
4. 配置專案設定：
   - **Framework Preset**: Next.js
   - **Root Directory**: `hw6/my-line-bot`
   - **Build Command**: `npm run build`（自動偵測）
   - **Output Directory**: `.next`（自動偵測）
5. 添加環境變數（見下方「環境變數設定」）
6. 點擊 "Deploy"

### 環境變數設定

在 Vercel Dashboard → Settings → Environment Variables 中添加：

| 變數名稱 | 說明 | 必填 |
|---------|------|------|
| `LINE_CHANNEL_ACCESS_TOKEN` | Line Bot Channel Access Token | ✅ |
| `LINE_CHANNEL_SECRET` | Line Bot Channel Secret | ✅ |
| `GEMINI_API_KEY` | Google Gemini API Key | ✅ |
| `DATABASE_URL` | PostgreSQL 資料庫連接字串 | ✅ |
| `POSTGRES_URL` | Vercel Postgres 連接字串（如果使用 Vercel Postgres） | ⚠️ |

**注意**：
- 如果使用 Vercel Postgres，`DATABASE_URL` 和 `POSTGRES_URL` 通常會自動設定
- 如果手動設定，兩個變數的值應該相同

### 設定 Line Webhook

部署完成後，在 Line Developers Console 中：

1. 前往您的 Channel 設定
2. 進入 "Messaging API" 分頁
3. 在 "Webhook URL" 欄位填入：`https://hw6-bot.vercel.app/api/webhooks/line`
   - **注意**：路徑是 `/api/webhooks/line`（webhooks 是複數）
4. 點擊 "Verify" 測試連線
5. 啟用 "Use webhook"

## ✨ 功能特色

### 基礎功能

- ✅ **Line Bot Webhook 整合**：接收並處理 LINE 訊息
- ✅ **智能對話系統**：整合 Google Gemini API 提供 AI 對話功能
- ✅ **關鍵字匹配**：快速回應常見問題（地址、服務、預約等）
- ✅ **多語系支援**：支援繁體中文與英文
- ✅ **Rich Menu**：提供 8 個快捷功能按鈕
- ✅ **訊息類型支援**：文字、圖片、影片、音訊、位置、貼圖
- ✅ **對話記錄儲存**：使用 PostgreSQL 資料庫持久化所有對話

### 進階功能

- ✅ **管理後台**：完整的監控與管理介面
  - 對話列表與訊息列表
  - 使用者資訊顯示
  - 統計數據（總對話數、活躍對話、總訊息數等）
- ✅ **系統健康檢查**：`/api/health` 端點監控系統狀態
  - 資料庫連接狀態
  - 環境變數檢查
- ✅ **效能監控**：追蹤回應時間與慢查詢
  - 平均回應時間
  - 慢查詢統計（處理時間 > 3 秒）
- ✅ **進階搜尋**：支援訊息內容全文搜尋
  - 大小寫不敏感搜尋
  - 可與其他篩選條件組合使用

## 📁 專案結構

```
my-line-bot/
├── app/
│   ├── admin/
│   │   └── page.tsx              # 管理後台頁面
│   ├── api/
│   │   ├── admin/                # 管理 API
│   │   │   ├── messages/         # 訊息管理
│   │   │   ├── conversations/    # 對話管理
│   │   │   ├── stats/            # 統計數據
│   │   │   └── users/            # 使用者資訊
│   │   ├── health/               # 健康檢查端點
│   │   └── webhooks/
│   │       └── line/             # Line Webhook 處理
│   ├── page.tsx                  # 首頁
│   └── layout.tsx
├── lib/
│   ├── bot/
│   │   ├── eventHandler.ts       # 事件處理器
│   │   ├── richMenuConfig.ts     # Rich Menu 配置
│   │   └── router.ts             # 路由處理
│   ├── db/
│   │   └── prisma.ts             # Prisma 資料庫連接
│   ├── i18n/                     # 多語系內容
│   └── services/                  # 業務邏輯服務
│       ├── llmService.ts         # Gemini API 封裝
│       ├── conversationService.ts # 對話管理
│       └── ...
├── prisma/
│   └── schema.prisma             # 資料庫 Schema
├── scripts/
│   ├── createRichMenu.ts         # Rich Menu 建立腳本
│   └── test-features.ts          # 功能測試腳本
├── .env.example                   # 環境變數範本
├── vercel.json                    # Vercel 配置
└── package.json
```

## 🔧 技術棧

- **框架**: [Next.js](https://nextjs.org) 16.0.3 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **資料庫**: PostgreSQL (Vercel Postgres)
- **ORM**: Prisma 6.19.0
- **Line Bot SDK**: @line/bot-sdk 10.5.0
- **AI 服務**: Google Gemini API (gemini-2.0-flash-exp)
- **部署平台**: Vercel

## 📝 環境變數說明

### 必填環境變數

| 變數名稱 | 說明 | 取得方式 |
|---------|------|---------|
| `LINE_CHANNEL_ACCESS_TOKEN` | Line Bot Channel Access Token | [Line Developers Console](https://developers.line.biz/console/) |
| `LINE_CHANNEL_SECRET` | Line Bot Channel Secret | [Line Developers Console](https://developers.line.biz/console/) |
| `GEMINI_API_KEY` | Google Gemini API Key | [Google AI Studio](https://aistudio.google.com/) |
| `DATABASE_URL` | PostgreSQL 資料庫連接字串 | Vercel Postgres 或自行設定的 PostgreSQL |

### 環境變數格式範例

```env
# Line Bot
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
LINE_CHANNEL_SECRET=your_channel_secret_here

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# 資料庫（Vercel Postgres 格式）
DATABASE_URL=postgres://username:password@host:port/database?sslmode=require
POSTGRES_URL=postgres://username:password@host:port/database?sslmode=require
```

## 🧪 測試功能

### 測試進階功能

```bash
npm run test-features
```

此腳本會測試：
- ✅ 健康檢查端點 (`/api/health`)
- ✅ 效能統計數據 (`/api/admin/stats`)
- ✅ 內容搜尋功能 (`/api/admin/messages?search=關鍵字`)

### 手動測試

1. **測試 LINE Bot**：
   - 在 LINE 中搜尋 `@335qqqlp` 或掃描 QR Code
   - 發送訊息測試各種功能

2. **測試管理後台**：
   - 訪問 [https://hw6-bot.vercel.app/admin](https://hw6-bot.vercel.app/admin)
   - 檢查系統狀態區塊是否正常顯示
   - 測試內容搜尋功能

3. **測試健康檢查**：
   - 訪問 [https://hw6-bot.vercel.app/api/health](https://hw6-bot.vercel.app/api/health)
   - 應該返回 JSON 格式的健康狀態

## 📚 相關文件

- **對話設計文件**: [chatbot-design.md](../chatbot-design.md)
- **部署指南**: [DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md)
- **故障排除**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## ⚠️ 注意事項

- ✅ 確保 `.env.local` 檔案已加入 `.gitignore`（預設已包含）
- ✅ Webhook URL 必須是 HTTPS
- ✅ Google Gemini API 有免費額度，請注意使用量
- ✅ 請勿將任何敏感金鑰放入 Git 版本控制
- ✅ 部署時請以環境變數注入敏感資訊

## 🔍 故障排除

### 問題：Bot 沒有回應

1. 檢查 Vercel 部署狀態：前往 [Vercel Dashboard](https://vercel.com/dashboard) 確認部署成功
2. 檢查環境變數：確認所有必填環境變數已正確設定
3. 檢查 Webhook URL：確認 Line Developers Console 中的 Webhook URL 正確
4. 查看日誌：在 Vercel Dashboard → Deployments → Logs 查看錯誤訊息

### 問題：後台顯示「載入中...」

1. 檢查資料庫連接：確認 `DATABASE_URL` 正確設定
2. 檢查 API 端點：訪問 `/api/health` 確認系統狀態
3. 清除瀏覽器緩存：按 `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)

### 問題：健康檢查失敗

1. 檢查資料庫連接字串格式
2. 確認環境變數已正確設定
3. 查看 Vercel Function Logs 獲取詳細錯誤訊息

## 📞 聯絡資訊

如有問題，請參考：
- [Line Developers 文件](https://developers.line.biz/zh-hant/docs/)
- [Google Gemini API 文件](https://ai.google.dev/docs)
- [Vercel 文件](https://vercel.com/docs)

---

**專案狀態**: ✅ 已部署並正常運作  
**最後更新**: 2025-11-25
