# Wall 頁面開發階段總結

## ✅ 已完成階段

### Phase 0: 最小可用 UI（假資料）✅
- ✅ W 導航按鈕（底部導航欄，D、M、P 之後，Logout 之前）
- ✅ `/w` 路由頁面
- ✅ Threads 風格 feed UI
- ✅ 貼文卡片（頭像、名稱、時間、內容、圖片）

### Phase 1: 自由貼文 CRUD（真實資料）✅
- ✅ Prisma Post 模型
- ✅ GET /api/posts（取得所有貼文，按時間倒序）
- ✅ POST /api/posts（建立新貼文，支援文字 + 圖片）
- ✅ 圖片上傳到 Vercel Blob（sharp 處理）
- ✅ 前端發文表單（文字輸入、圖片選擇、預覽、移除）
- ✅ 真實資料 feed（從 API 載入並自動更新）

### Phase 2: 每日主題貼文 ✅
- ✅ Prisma DailyTopic 模型
- ✅ GET /api/daily-topics（取得今日主題，自動生成）
- ✅ POST /api/daily-topics（建立/更新每日主題）
- ✅ Gemini API 整合（自動生成每日主題）
- ✅ Wall 頁面顯示「今日話題」區塊
- ✅ 發文時可勾選「針對今日話題發文」
- ✅ 主題貼文顯示 📌 標籤

### Phase 3: 配對解鎖姓名/聊天室 ✅
- ✅ 配對檢查邏輯（查詢 Match 表，雙向檢查）
- ✅ 姓名隱藏機制（未配對時顯示 "????" 和提示）
- ✅ 從貼文配對功能（POST /api/posts/[postId]/match）
- ✅ 配對/聊天按鈕（未配對顯示「想要配對」，已配對顯示「聊天」）
- ✅ 雙向配對邏輯（雙方都點擊後自動配對）

### Phase 4: 每日配對上限 ✅
- ✅ 每日配對上限檢查（限制 3 個）
- ✅ GET /api/notifications/daily-match-count（取得今日配對次數）
- ✅ Wall 頁面底部顯示配對狀態（「今日已配對：X / 3」）
- ✅ 顯示剩餘配對次數（「還可配對 X 人」）
- ✅ 達到上限時按鈕禁用（顯示「已達上限」）

### 通知系統 ✅
- ✅ GET /api/notifications/pending-matches（取得待處理配對請求）
- ✅ NotificationBadge 組件（在 M 按鈕上顯示紅色徽章）
- ✅ Matches 頁面顯示待處理配對請求列表
- ✅ POST /api/matches/[matchId]/accept（接受配對請求）
- ✅ POST /api/matches/[matchId]/reject（拒絕配對請求）
- ✅ Toast 通知組件（像素風格，替代 alert）

## 📋 功能清單

### Wall 頁面功能
1. **瀏覽貼文**
   - 顯示所有貼文（按時間倒序）
   - 貼文卡片包含：頭像、名稱、時間、內容、圖片
   - 支援主題貼文（顯示 📌 標籤）

2. **發文功能**
   - 文字輸入（多行）
   - 圖片上傳（選擇、預覽、移除）
   - 可選擇針對今日話題發文
   - 圖片自動處理（resize 800x800）

3. **每日主題**
   - 自動生成（使用 Gemini API）
   - 顯示今日話題區塊
   - 顯示主題貼文數量

4. **配對功能**
   - 未配對時：顯示 "????" 和「想要配對」按鈕
   - 已配對時：顯示真實姓名和「聊天」按鈕
   - 每日配對上限：3 個
   - 顯示配對狀態和剩餘次數

5. **通知系統**
   - M 按鈕顯示通知徽章（待處理配對請求數量）
   - Matches 頁面顯示待處理請求列表
   - 可以接受或拒絕配對請求
   - Toast 通知（像素風格）

## 🔄 待實作階段

### Phase 5: LLM 生成每日主題（部分完成）
- ✅ Gemini API 整合
- ✅ 自動生成每日主題
- ⚠️ 可以進一步優化 prompt 和生成邏輯

## 📁 檔案結構

### 新建的檔案
- `app/w/page.tsx` - Wall 頁面
- `app/api/posts/route.ts` - 貼文 API
- `app/api/posts/[postId]/match/route.ts` - 從貼文配對 API
- `app/api/daily-topics/route.ts` - 每日主題 API
- `app/api/notifications/pending-matches/route.ts` - 待處理配對請求 API
- `app/api/notifications/daily-match-count/route.ts` - 每日配對次數 API
- `app/api/matches/[matchId]/accept/route.ts` - 接受配對 API
- `app/api/matches/[matchId]/reject/route.ts` - 拒絕配對 API
- `components/NotificationBadge.tsx` - 通知徽章組件
- `components/Toast.tsx` - Toast 通知組件

### 修改的檔案
- `components/Navigation.tsx` - 新增 W 按鈕和通知徽章
- `prisma/schema.prisma` - 新增 Post 和 DailyTopic 模型
- `app/globals.css` - 新增 Toast 動畫
- `app/matches/page.tsx` - 顯示待處理配對請求

## 🎯 驗收標準

### Phase 0 ✅
- [x] 底部導航欄有 W 按鈕
- [x] 點擊 W 進入 `/w` 頁面
- [x] 頁面顯示 Threads 風格的 feed UI

### Phase 1 ✅
- [x] 可以發佈自由貼文（文字）
- [x] 可以發佈自由貼文（文字 + 圖片）
- [x] 圖片正確上傳到 Vercel Blob 並顯示
- [x] Feed 從資料庫真實載入並顯示
- [x] 貼文按時間倒序排列
- [x] 發文後 feed 自動更新

### Phase 2 ✅
- [x] 每日主題自動生成（使用 Gemini API）
- [x] Wall 頁面顯示「今日話題」區塊
- [x] 可以針對今日話題發文
- [x] 主題貼文顯示 📌 標籤

### Phase 3 ✅
- [x] 未配對時顯示 "????" 和提示文字
- [x] 已配對時顯示真實姓名
- [x] 可以從貼文配對（點擊「想要配對」）
- [x] 配對成功後顯示「聊天」按鈕

### Phase 4 ✅
- [x] 每天最多只能從貼文中配對 3 個人
- [x] 達到上限時按鈕禁用
- [x] 顯示配對狀態和剩餘次數

### 通知系統 ✅
- [x] M 按鈕顯示通知徽章
- [x] Matches 頁面顯示待處理配對請求
- [x] 可以接受或拒絕配對請求
- [x] 使用 Toast 通知替代 alert

## 📊 統計

- **總共實作階段：** Phase 0-4 + 通知系統
- **API 端點：** 10+ 個
- **前端組件：** 3 個（Wall 頁面、NotificationBadge、Toast）
- **資料庫模型：** 2 個（Post、DailyTopic）
- **整合服務：** Gemini API（自動生成每日主題）

## 🚀 部署狀態

- ✅ 程式碼已推送到 GitHub
- ⚠️ 需要設定環境變數：
  - `GEMINI_API_KEY` - Gemini API 金鑰（用於自動生成每日主題）
  - `DATABASE_URL` - PostgreSQL 連接字串
  - `BLOB_READ_WRITE_TOKEN` - Vercel Blob 儲存 token
  - `JWT_SECRET` - JWT 密鑰

## 📝 備註

- Phase 5（LLM 生成每日主題）已經部分完成（使用 Gemini API）
- 所有核心功能都已實作完成
- 可以開始測試和部署
