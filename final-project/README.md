# NTU Dating Platform

> Pixel-art style dating app with Google OAuth, email/password login, energy system, Q&A game, AI coach personas, and real-time chat (Pusher/polling fallback).

## 專案簡介

這是一個使用 Next.js 14 (App Router) + Prisma + PostgreSQL 打造的交友平台，特色包含：
- Google OAuth / Email 密碼登入、忘記密碼與郵件重設
- Pixel 風格 UI，全英文化面，導航統一到 Home/Wall
- 能量機制：每日自動補滿、發文回饋、按讚解鎖配對機會，能量不會低於 0
- Q&A 遊戲：每局扣 5 能量，雙方回答與猜測即時同步（Pusher + polling）
- AI Coach：三種人設（小奶狗/霸道總裁/高貴御姐），提供可直接發送的開場白
- 帖子、主題搜尋、熱門主題、排行榜（配對數 Top 10）
- 即時聊天：訊息 optimistic 更新，若 Pusher 遺漏以 5s 輪詢補齊
- 照片模糊等級計算統一，支援 Vercel Blob

## 目錄重點

- `app/`：前端頁面與 API Route（Next.js App Router）
- `app/api/**`：後端 API（Auth、Game、Chat、Posts、Matches、Leaderboard、Energy）
- `app/chat/[matchId]/page.tsx`：聊天與 Q&A 遊戲邏輯（含 Pusher + Polling）
- `app/discover/page.tsx`：配對頁，顯示 Energy，評分後即時扣能量，無名單時自動提示
- `app/home/page.tsx`：主頁，右側顯示熱門主題與配對排行榜
- `lib/energy.ts`：每日補能量、能量上限/扣除的工具
- `prisma/schema.prisma`：資料模型
- `scripts/fix-questions-zh-tw.js`：將 Q&A 題庫轉為繁體中文
- `components/Navigation.tsx` / `components/LeftSidebar.tsx`：導航與側欄（Pixel 風）

## 系統功能

- 認證：Google OAuth、Email/密碼、忘記密碼郵件、Gmail 註冊限制
- 能量：每日補滿 100、發文 +10（不超過上限）、按讚 3 次且配對少於 3 次時 +1 配對機會、扣能量不會 < 0
- 配對：Discover 評分 1–5；無名單會提示「已經沒有可配對的人了」
- 貼文：建立、按讚、查看主題與作者，無貼文時提示
- 排行榜：配對數 Top 10（含 userId、bio、模糊頭貼）
- Q&A 遊戲：每局扣 5 能量，題目繁中，答案/猜測即時同步；開場題目依主題
- AI Coach：三人設，點擊即填入可直接發送的訊息
- 聊天：訊息 optimistic 更新，Pusher 失效時 5 秒輪詢補齊
- UI：Pixel 風格、黑白高對比按鈕、Hover 藍白、全英文化面

## 技術棧

- Next.js 14 (App Router), TypeScript
- Tailwind CSS（客製 Pixel 主題）
- Prisma + PostgreSQL
- Pusher（即時），並有 polling fallback
- Nodemailer（忘記密碼）
- Vercel Blob（照片）
- GitHub Actions / Vercel 部署

## 環境變數

主要：
- `DATABASE_URL`：Prisma 連線（建議直連 Postgres；若用 Data Proxy，請另設 `DIRECT_DATABASE_URL`）
- `DIRECT_DATABASE_URL`：可直連的 Postgres URL，給 db push/migrate 用（避免 P1001）
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL` / `NEXTAUTH_URL`（若有）
- `EMAIL_SERVER_USER` / `EMAIL_SERVER_PASS` / `EMAIL_FROM`
- `BLOB_READ_WRITE_TOKEN`
- `PUSHER_APP_ID` / `PUSHER_SECRET` / `NEXT_PUBLIC_PUSHER_APP_KEY` / `NEXT_PUBLIC_PUSHER_CLUSTER`
- `GEMINI_API_KEY`

## 快速開始（本地）

```bash
npm install
cp .env.example .env.local  # 填入上方變數
npm run dev
```

若要轉繁中題庫（一次性）：
```bash
node scripts/fix-questions-zh-tw.js
```

## 部署建議（Vercel）

- Build Command：`npm run build`
- 若使用 Data Proxy，請新增 `DIRECT_DATABASE_URL` 並在 `schema.prisma` 加上 `directUrl = env("DIRECT_DATABASE_URL")` 供 `prisma db push` 使用。
- 確保 Google OAuth 已授權 redirect URI：`https://<你的網域>/api/auth/google/callback`

## 截圖放置

- 建議放在 `final-project/docs/assets/` 底下，再用相對路徑引用：
  - Hero/首頁：`docs/assets/home.png`
  - Discover：`docs/assets/discover.png`
  - Chat + Q&A：`docs/assets/chat-qa.png`
  - 排行榜/Sidebar：`docs/assets/sidebar-leaderboard.png`
  - Pixel 按鈕示意：`docs/assets/ui-buttons.png`

README 引用範例：
```markdown
![Home](docs/assets/home.png)
![Discover](docs/assets/discover.png)
```

## 重要路由與行為

- `/auth/login`：Google OAuth（hd 檢查）、Email/密碼登入，10 分鐘內免重登
- `/auth/google/callback`：伺服器端換 token，驗證 email & hd=g.ntu.edu.tw
- `/discover`：顯示能量、評分配對；無名單提示已無人可配對
- `/home`：主頁，右側熱門主題 + 配對排行榜
- `/chat/[matchId]`：訊息 + Q&A 遊戲，Pusher + 5s polling

## 開發指令

```bash
npm run dev        # 開發
npm run build      # 建置
npm run lint       # Lint
npm run typecheck  # 型別檢查
```

## 注意事項

- 能量扣除處處防呆：不會 < 0；評分/遊戲扣能量後即時同步
- Google OAuth：若 email 缺失或 hd 非 g.ntu.edu.tw，會導回 login 並顯示錯誤
- 若使用 Data Proxy，請務必提供 direct URL 供 `db push`，避免部署 P1001


