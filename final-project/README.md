# Shibuya - 全臺大學生專用免費交友軟體

> Deployed service 網址：  
> https://ntu-dating-platform1.vercel.app


## 專案簡介

Shibuya 是一個使用 Next.js 14 (App Router) + Prisma + PostgreSQL 打造的全臺大學生專用交友平台，特別台大人的時間很貴，別再浪費在付費還配對不到的爛 App 上了！

我們把 AI 模型塞進聊天室，解決你的社交恐懼； 我們把 即時互動遊戲 寫進訊息流，因為無聊是最大的罪過； 我們堅持注重個性與社群連結，因為這裡不是看臉的菜市場。

重點是：它免費。

這是一個工程師對交友體驗的最高致敬。 你懂技術，你更該懂選擇。

## 開發指令

```bash
npm run dev        # 開發模式（http://localhost:3000）
npm run build      # 建置生產版本
npm run start      # 啟動生產伺服器
npm run lint       # Lint 檢查
npm run typecheck  # TypeScript 型別檢查
```


## 部署建議（Vercel）

### 1. 準備部署

1. 將專案推送到 GitHub
2. 在 Vercel 中匯入專案
3. 設定 Root Directory 為 `final-project`

### 2. 設定環境變數

在 Vercel 專案設定中新增所有環境變數（參考上方「環境變數」區塊）：
- 資料庫連線字串
- Google OAuth 憑證
- JWT Secret
- Pusher 配置
- Vercel Blob Token
- Gemini API Key
- 郵件服務配置

### 3. 設定建置指令

在 Vercel 專案設定中：
- **Build Command**: `npm run build`（或 `npm run vercel-build`）
- **Install Command**: `npm install`
- **Output Directory**: `.next`

### 4. 設定 Google OAuth

1. 在 Google Cloud Console 中設定「已授權的重新導向 URI」：
   - `https://your-project.vercel.app/api/auth/google/callback`
2. 確保 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 已正確設定

### 5. 資料庫設定

- 若使用 Prisma Data Proxy，請新增 `DIRECT_DATABASE_URL` 並在 `schema.prisma` 加上 `directUrl = env("DIRECT_DATABASE_URL")` 供 `prisma db push` 使用
- 確保 `DATABASE_URL` 已正確設定
- 部署前執行 `npx prisma db push` 確保 schema 同步

### 6. 部署後檢查

- 檢查 Vercel 部署日誌，確認建置成功
- 測試 Google OAuth 登入功能
- 測試 API 端點是否正常運作
- 檢查環境變數是否正確載入

## 快速開始（本地）

### 前置需求
- Node.js 18+
- PostgreSQL 資料庫（或 Prisma Data Proxy）
- Google OAuth 憑證
- Pusher 帳號
- Vercel Blob Storage（可選，用於照片上傳）
- Gemini API Key（可選，用於每日主題生成）

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 並建立 `.env.local`：

```bash
cp .env.example .env.local
```

填入所有必要的環境變數（參考上方「環境變數」區塊）。

### 3. 初始化資料庫

```bash
# 生成 Prisma Client
npx prisma generate

# 推送 schema 至資料庫（開發環境）
npx prisma db push

# 或使用 migration（生產環境）
npx prisma migrate dev
```

### 4. 轉繁中題庫（一次性）

```bash
node scripts/fix-questions-zh-tw.js
```

### 5. 啟動開發伺服器

```bash
npm run dev
```

伺服器將在 [http://localhost:3000](http://localhost:3000) 啟動。

### 6. 設定 Google OAuth

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立 OAuth 2.0 Client ID
3. 設定「已授權的重新導向 URI」：
   - 本地開發：`http://localhost:3000/api/auth/google/callback`
   - 生產環境：`https://your-domain.vercel.app/api/auth/google/callback`

## 特色功能（詳細說明）

### 認證系統
- **Google OAuth 登入**：
  - 支援 Google 帳號一鍵登入
  - 驗證 email 必須存在，缺失會導回登入頁並顯示錯誤
  - 伺服器端 token 交換，確保安全性
  - 成功後自動跳轉至 `/discover` 頁面
- **Email/密碼登入**：
  - 傳統帳號密碼登入方式
  - 支援註冊新帳號
  - 密碼使用 bcrypt 加密儲存
- **忘記密碼功能**：
  - 輸入 email 後發送重設連結至信箱
  - 使用 Nodemailer 發送郵件
  - 重設連結包含 JWT token，有效期限制
  - 重設頁面可設定新密碼
- **10 分鐘內免重登**：
  - 登入成功後 10 分鐘內可直接進站
  - 使用 localStorage 記錄最近登入時間
  - 自動檢查 token 有效性並恢復用戶狀態

### 能量機制
- **每日自動補滿**：
  - 每日 06:00 UTC+8 自動補滿至能量上限（預設 50）
  - 使用 `lastEnergyRefill` 欄位追蹤最後補滿時間
  - 每次 API 請求時檢查並自動補滿（`lib/energy.ts`）
- **能量獲得方式**：
  - 發文：每次發文 +10 能量（不超過上限）
  - 按讚解鎖配對機會：按讚 3 次且配對少於 3 次時 +1 配對機會
- **能量消耗**：
  - Discover 評分：每次評分消耗能量（根據評分數值）
  - Q&A 遊戲：每局扣 5 能量
  - 能量扣除防呆：所有扣除操作都確保能量不會 < 0（使用 `clampEnergy` 函數）
- **即時同步**：
  - 評分/遊戲扣能量後立即更新前端顯示
  - 使用 `refreshEnergy()` 即時同步能量狀態

### 配對系統
- **Discover 頁面**：
  - 顯示推薦用戶清單（基於標籤匹配度）
  - 顯示當前能量值
  - 評分功能：1-5 分評分系統，雙方分數總和大於7即可私訊聊天
  - 評分後即時扣能量並移至下一位
  - 無名單時顯示「已經沒有可配對的人了」提示
  - 顯示用戶照片（一開始模糊，可蒐集鑰ㄕ）、標籤、共同興趣
- **配對流程**：
  - 雙方互相評分後自動建立 Match
  - 配對成功後可進入聊天室
  - 顯示配對時間和最後訊息預覽
- **配對限制**：
  - 每日配對上限：3 次
  - 顯示剩餘配對次數
  - 達到上限後無法繼續評分

### 貼文系統
- **建立貼文**：
  - 用戶輸入內容
  - 選擇是否上傳圖片（Vercel Blob）
  - 可選擇針對「今日主題」發文
  - 可選擇「使用者主題（board）」發文
  - 支援搜尋或建立新主題
  - 提交後即時顯示在貼文列表
  - 發文成功後 +10 能量
- **貼文操作**：
  - 按讚功能：點擊愛心按鈕即可按讚
  - 查看主題與作者：點擊可進入主題頁或作者檔案
  - 編輯/刪除：作者可編輯或刪除自己的貼文
  - 收藏功能：可將喜歡的貼文加入收藏
  - 從貼文配對：點擊「配對」按鈕，發起配對請求
- **貼文篩選**：
  - 排序：最新（latest）/ 熱門（trending）
  - 篩選：依主題（topicId）、依作者（authorId）
  - 無貼文時顯示友善提示
- **貼文顯示**：
  - 顯示作者名稱（未配對時為匿名）
  - 顯示發文時間（相對時間：剛剛、X 分鐘前、X 小時前、X 天前）
  - 顯示圖片預覽
  - 顯示按讚數和是否已按讚

### Q&A 遊戲
- **遊戲機制**：
  - 每局扣 5 能量
  - 題目繁體中文，分類為：興趣（interest）、個性（personality）、生活方式（lifestyle）
  - 開場題目依主題選擇
  - 雙方回答與猜測即時同步（Pusher + polling fallback）
- **遊戲流程**：
  - 發起遊戲：選擇主題後發起 Q&A 遊戲
  - 回答問題：雙方各自回答問題
  - 猜測答案：猜測對方的答案
  - 完成遊戲：完成後可獲得鑰匙解鎖照片
- **即時同步**：
  - 使用 Pusher 即時推送遊戲狀態更新
  - 若 Pusher 失效，使用 5 秒輪詢補齊
  - 顯示遊戲進度和解鎖進度

### AI Coach
- **三種人設**：
  - 小奶狗（Puppy）：可愛、親切的開場白
  - 霸道總裁（Boss）：自信、直接的開場白
  - 高貴御姐（Queen）：優雅、成熟的開場白
- **功能**：
  - 提供可直接發送的開場白（點擊即填入輸入框）
  - 根據目標用戶標籤生成個人化建議
  - 提供個人檔案優化建議（照片數量、bio 長度、標籤數量）
  - 提供話題建議（根據配對對象的興趣標籤）

### 即時聊天
- **訊息功能**：
  - 訊息 optimistic 更新：發送後立即顯示，無需等待伺服器回應
  - Pusher 即時推送：新訊息即時顯示
  - 若 Pusher 遺漏以 5 秒輪詢補齊
  - 顯示發送者頭像（模糊等級）
  - 顯示訊息時間戳
- **聊天室功能**：
  - 顯示配對對象資訊
  - 顯示解鎖進度
  - 整合 Q&A 遊戲面板
  - 顯示 AI Coach 開場白建議

### 照片模糊與解鎖
- **模糊等級計算**：
  - 初始模糊等級：100（完全模糊）
  - 根據解鎖進度動態調整：`blurLevel = 100 - (unlockLevel * 10)`
  - 使用 CSS `filter: blur()` 實現視覺效果
- **解鎖機制**：
  - 透過 Q&A 遊戲完成獲得鑰匙
  - 使用鑰匙解鎖照片
  - 更新解鎖進度（unlockLevel）
  - 重新計算模糊等級
  - 照片逐漸清晰

### 排行榜
- **配對數 Top 10**：
  - 顯示配對數最高的 10 位用戶
  - 顯示 userId、bio、模糊頭貼
  - 顯示在 Home 頁面右側
  - 點擊可查看用戶檔案

### 主題系統
- **每日主題**：
  - 使用 Gemini API 自動生成每日話題
  - 每天一個主題，鼓勵用戶針對主題發文
  - 顯示今日主題和貼文數量
- **熱門主題**：
  - 依貼文數排序
  - 顯示在 Home 頁面左側
  - 點擊可進入主題頁面查看所有相關貼文
- **使用者自創主題（board）**：
  - 使用者可搜尋或建立新主題
  - 發文時可選擇主題
  - 主題頁面顯示所有相關貼文
- **主題搜尋**：
  - 即時搜尋功能（300ms debounce）
  - 搜尋結果即時顯示
  - 可快速建立新主題

### 導航系統
- **左側邊欄**（`components/LeftSidebar.tsx`）：
  - Home：主頁，顯示貼文、熱門主題、排行榜
  - Search：搜尋主題頁面
  - Saved：收藏的貼文
  - My：我的貼文
  - 固定左側，寬度 80px（w-20）
  - 登入後顯示，聊天頁面自動隱藏
- **底部導航**（`components/Navigation.tsx`）：
  - Discover：配對頁面
  - Matches：配對列表
  - Profile：個人檔案
  - Wall：貼文牆
  - Logout：登出
  - 固定底部，聊天頁面自動隱藏


## 目錄結構（重點）

```
ntu-dating-platform/          # 根目錄 (monorepo 管理, 可選)
├── final-project/            # 生產環境 (當前 Vercel 部署)
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API Routes (後端端點)
│   │   │   ├── auth/         # 認證相關 API
│   │   │   ├── chat/         # 聊天 API
│   │   │   ├── matches/      # 配對 API
│   │   │   ├── posts/        # 貼文 API
│   │   │   ├── game/         # Q&A 遊戲 API
│   │   │   └── ...
│   │   ├── auth/             # 認證頁面
│   │   ├── discover/         # 配對頁面
│   │   ├── home/             # 首頁
│   │   ├── chat/             # 聊天頁面
│   │   └── ...
│   ├── components/           # React 組件
│   │   ├── LeftSidebar.tsx   # 左側邊欄
│   │   ├── Navigation.tsx    # 底部導航
│   │   └── ...
│   ├── lib/                  # 工具函數
│   │   ├── prisma.ts         # Prisma Client
│   │   ├── auth.ts           # 認證工具
│   │   ├── energy.ts         # 能量管理
│   │   └── ...
│   ├── store/                # 狀態管理
│   │   └── authStore.ts      # 認證狀態 (Zustand)
│   ├── prisma/               # Prisma schema
│   │   └── schema.prisma     # 資料庫模型定義
│   ├── docs/                 # 文件與設計參考
│   │   └── design-references/# 頁面截圖與設計參考
│   ├── package.json          # Next.js 專案配置
│   ├── next.config.js        # Next.js 設定
│   └── ...
├── package.json              # 根目錄配置 (monorepo)
├── README.md                 # 本文件
├── .gitignore
└── LICENSE
```

### 重點目錄說明

- **`final-project/app/`**：Next.js App Router，包含所有頁面和 API Routes
- **`final-project/components/`**：可重用的 React 組件
- **`final-project/lib/`**：共用工具函數和服務
- **`final-project/store/`**：Zustand 狀態管理
- **`final-project/prisma/`**：資料庫 schema 定義
- **`final-project/docs/`**：專案文件和設計參考


## 系統功能（詳細說明）

### 認證流程
   
   ![登入頁面](docs/design-references/login-page.png)
   
1. **Google OAuth 登入**：
   - 點擊「Sign in with Google」
   - 重定向至 Google 授權頁面
   - Google 回調至 `/api/auth/google/callback`
   - 驗證 email 必須存在
   - 建立或更新用戶資料
   - 生成 JWT token 並重定向至 `/auth/google/success`
   - 成功頁面解析 token 和用戶資料，設定 authStore
   - 自動跳轉至 `/discover`
2. **Email/密碼登入**：
   - 輸入 email 和密碼
   - 後端驗證密碼（bcrypt）
   - 生成 JWT token
   - 設定 authStore 並跳轉至 `/discover`
3. **忘記密碼流程**：

   ![忘記密碼頁面](docs/design-references/forgot-password-page.png)

   - 用戶輸入 email
   - 後端生成重設 token（JWT）
   - 發送重設連結至 email（使用 Nodemailer）
   
   ![重設密碼頁面](docs/design-references/reset-password-page.png)
   
   - 用戶點擊連結進入重設頁面
   - 輸入新密碼並提交
   
   ![註冊頁面](docs/design-references/register-page.png)
   
   - 後端驗證 token 並更新密碼
4. **10 分鐘內免重登**：
   - 登入成功後 10 分鐘內可直接進站
   - 使用 localStorage 記錄最近登入時間
   - 自動檢查 token 有效性並恢復用戶狀態

### 能量管理流程

![Home/Wall 頁面](docs/design-references/home-wall-page.jpg)

1. **每日補滿檢查**：
   - 每次 API 請求時檢查 `lastEnergyRefill`
   - 若距離上次補滿已超過 06:00 UTC+8，自動補滿至上限
   - 更新 `lastEnergyRefill` 時間戳
2. **能量獲得**：
   - 發文成功後：`energy = clampEnergy(energy + 10, energyMax)`
   - 按讚解鎖配對機會：檢查條件後增加配對機會
3. **能量消耗**：
   - Discover 評分：每次評分消耗能量（根據評分數值）
   - Q&A 遊戲：每次發起遊戲扣除 5 能量
   - 能量扣除防呆：所有扣除操作都使用 `clampEnergy` 確保不會 < 0

### 配對流程

![Discover 頁面](docs/design-references/discover-page.jpg)

1. **推薦算法**：
   - 基於用戶標籤匹配度計算
   - 排除已評分過的用戶
   - 排除已配對的用戶
   - 返回推薦用戶清單
2. **評分流程**：
   - 用戶在 Discover 頁面看到推薦用戶
   - 顯示用戶照片（模糊等級）、標籤、共同興趣
   - 用戶評分 1-5 分
   - 即時扣除能量
   - 檢查是否互相評分，若雙方都評分則建立 Match
   - 移至下一位推薦用戶
3. **配對成功**：
   - 建立 Match 記錄
   - 雙方可在 Matches 頁面看到配對對象
   - 點擊可進入聊天室
4. **配對限制**：
   - 能量用盡後無法繼續評分

### Q&A 遊戲流程

![Q&A 遊戲頁面](docs/design-references/qa-game-page.jpg)

1. **發起遊戲**：
   - 用戶選擇主題
   - 系統選擇對應主題的題目
   - 扣除 5 能量
   - 建立遊戲會話（GameSession）
   - 使用 Pusher 通知對方遊戲開始
2. **回答問題**：
   - 雙方各自回答問題
   - 答案即時同步（Pusher + polling）
   - 顯示回答進度
3. **猜測答案**：
   - 雙方猜測對方的答案
   - 猜測即時同步（Pusher + polling）
   - 顯示猜測結果
4. **完成遊戲**：
   - 遊戲完成後獲得鑰匙
   - 更新解鎖進度
   - 使用鑰匙可解鎖照片

### AI Coach
- **三種人設**：
  - 小奶狗（Puppy）：可愛、親切的開場白
  - 霸道總裁（Boss）：自信、直接的開場白
  - 高貴御姐（Queen）：優雅、成熟的開場白
- **功能**：
  - 提供可直接發送的開場白（點擊即填入輸入框）
  - 根據目標用戶標籤生成個人化建議
  - 提供個人檔案優化建議（照片數量、bio 長度、標籤數量）
  - 提供話題建議（根據配對對象的興趣標籤）

### 照片模糊與解鎖
1. **模糊等級計算**：
   - 初始模糊等級：100（完全模糊）
   - 根據解鎖進度動態調整：`blurLevel = 100 - (unlockLevel * 10)`
   - 使用 CSS `filter: blur()` 實現視覺效果
2. **解鎖機制**：
   - 完成 Q&A 遊戲獲得鑰匙
   - 使用鑰匙解鎖照片
   - 更新解鎖進度（unlockLevel）
   - 重新計算模糊等級
   - 照片逐漸清晰

### 即時聊天

![聊天頁面](docs/design-references/chat-page.jpg)

1. **訊息發送**：
   - 用戶輸入訊息
   - Optimistic 更新：立即顯示在聊天室
   - 發送 API 請求至後端
   - 後端儲存訊息並使用 Pusher 推送
   - 若 Pusher 成功，移除 optimistic 訊息，顯示真實訊息
   - 若 Pusher 失敗，使用 5 秒輪詢補齊
2. **訊息接收**：
   - Pusher 即時推送新訊息
   - 自動滾動至最新訊息
   - 顯示發送者頭像（模糊等級）
   - 顯示訊息時間戳

### 貼文流程

![貼文流程](docs/design-references/post-flow.png)


1. **建立貼文**：
   - 用戶輸入內容
   - 選擇是否上傳圖片（Vercel Blob）
   - 可選擇針對「今日主題」發文
   - 可選擇「使用者主題（board）」發文
   - 支援搜尋或建立新主題
   - 提交後即時顯示在貼文列表
   - 發文成功後 +10 能量
2. **貼文互動**：
   - 按讚功能：點擊愛心按鈕，即時更新按讚數
   - 收藏：點擊收藏按鈕，加入收藏列表
   - 查看主題：點擊主題標籤，進入主題頁面
   - 查看作者：點擊作者名稱，進入作者檔案
   - 從貼文配對：點擊「配對」按鈕，發起配對請求
3. **貼文篩選**：
   - 排序：最新（latest）/ 熱門（trending）
   - 篩選：依主題（topicId）、依作者（authorId）
   - 無貼文時顯示友善提示
4. **貼文顯示**：
   - 顯示作者名稱（未配對時為匿名）
   - 顯示發文時間（相對時間：剛剛、X 分鐘前、X 小時前、X 天前）
   - 顯示圖片預覽
   - 顯示按讚數和是否已按讚
### 排行榜
- **配對數 Top 10**：
  - 顯示配對數最高的 10 位用戶
  - 顯示 userId、bio、模糊頭貼
  - 顯示在 Home 頁面右側
  - 點擊可查看用戶檔案

### 主題系統
- **每日主題**：
  - 使用 Gemini API 自動生成每日話題
  - 每天一個主題，鼓勵用戶針對主題發文
  - 顯示今日主題和貼文數量
- **熱門主題**：
  - 依貼文數排序
  - 顯示在 Home 頁面左側
  - 點擊可進入主題頁面查看所有相關貼文
- **使用者自創主題（board）**：
  - 使用者可搜尋或建立新主題
  - 發文時可選擇主題
  - 主題頁面顯示所有相關貼文
- **主題搜尋**：
  - 即時搜尋功能（300ms debounce）
  - 搜尋結果即時顯示
  - 可快速建立新主題

### 導航系統
- **左側邊欄**（`components/LeftSidebar.tsx`）：
  - Home：主頁，顯示貼文、熱門主題、排行榜
  - Search：搜尋主題頁面
  - Saved：收藏的貼文
  - My：我的貼文
  - 固定左側，寬度 80px（w-20）
  - 登入後顯示，聊天頁面自動隱藏
- **底部導航**（`components/Navigation.tsx`）：
  - Discover：配對頁面
  - Matches：配對列表
  - Profile：個人檔案
  - Wall：貼文牆
  - Logout：登出
  - 固定底部，聊天頁面自動隱藏


## 技術棧

- **前端框架**：Next.js 14 (App Router), TypeScript
- **樣式框架**：Tailwind CSS（客製 Pixel 主題）
- **狀態管理**：Zustand（含 localStorage 持久化）
- **資料庫**：Prisma + PostgreSQL
- **即時通訊**：Pusher（即時推送），並有 5 秒 polling fallback
- **認證**：JWT（Bearer token）、Google OAuth 2.0
- **郵件服務**：Nodemailer（忘記密碼）
- **檔案儲存**：Vercel Blob Storage（照片上傳）
- **AI 服務**：Google Gemini API（每日主題生成、AI Coach）
- **部署**：Vercel（含環境變數管理）


## 環境變數

### 資料庫
- `DATABASE_URL`：Prisma 連線字串（PostgreSQL）
  - 格式：`postgres://user:password@host:5432/dbname?sslmode=require`
  - 若使用 Prisma Data Proxy，請另設 `PRISMA_DATABASE_URL`
- `DIRECT_DATABASE_URL`：可直連的 Postgres URL，給 `prisma db push` 用（避免 P1001 錯誤）

### 認證
- `GOOGLE_CLIENT_ID`：Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`：Google OAuth Client Secret
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`：客戶端使用的 Google Client ID（與 `GOOGLE_CLIENT_ID` 相同）
- `JWT_SECRET`：JWT 簽名密鑰（用於生成和驗證 token）
- `AUTH_SECRET`：認證密鑰（用於 NextAuth，若使用）

### 郵件服務
- `EMAIL_SERVER_USER`：SMTP 伺服器用戶名（Gmail）
- `EMAIL_SERVER_PASS`：SMTP 伺服器密碼（Gmail 應用程式密碼）
- `EMAIL_FROM`：發送郵件的地址
- `GMAIL_USER`：Gmail 帳號（可選，用於忘記密碼）
- `GMAIL_APP_PASSWORD`：Gmail 應用程式密碼（可選）

### 即時通訊（Pusher）
- `PUSHER_APP_ID`：Pusher App ID
- `PUSHER_KEY`：Pusher Key（與 `NEXT_PUBLIC_PUSHER_APP_KEY` 相同）
- `PUSHER_SECRET`：Pusher Secret
- `PUSHER_CLUSTER`：Pusher Cluster（如：ap3）
- `NEXT_PUBLIC_PUSHER_APP_KEY`：客戶端使用的 Pusher Key
- `NEXT_PUBLIC_PUSHER_CLUSTER`：客戶端使用的 Pusher Cluster

### 檔案儲存
- `BLOB_READ_WRITE_TOKEN`：Vercel Blob Storage 讀寫權限 token
- `SHARP_IGNORE_GLOBAL_LIBVIPS`：Sharp 圖片處理設定（設為 `1`）

### AI 服務
- `GEMINI_API_KEY`：Google Gemini API Key（用於每日主題生成和 AI Coach）

### 應用程式設定
- `NEXT_PUBLIC_APP_URL`：應用程式公開 URL（用於郵件連結）
- `NEXTAUTH_URL`：NextAuth URL（若使用 NextAuth）










