# Phase 0-1 功能檢查清單

## Phase 0: 最小可用 UI（假資料）

### ✅ 已完成項目

- [x] **導航按鈕**
  - ✅ 在 `Navigation.tsx` 新增 W 按鈕
  - ✅ 位置正確：在 P 之後，Logout 之前
  - ✅ 樣式符合像素風格（border-3, shadow）

- [x] **Wall 頁面路由**
  - ✅ 建立 `/w` 路由頁面
  - ✅ 頁面結構完整（Header, Feed, 底部 padding）

- [x] **Feed UI**
  - ✅ Threads 風格 feed 列表
  - ✅ 貼文卡片包含：頭像、名稱、時間、內容、圖片
  - ✅ 使用 `pixel-panel` 樣式類別
  - ✅ 時間顯示使用相對時間（formatTimeAgo）

### ⚠️ 注意事項

- 示意圖中顯示的「每日主題」區塊屬於 **Phase 2**，目前 Phase 0-1 不需要實作
- 示意圖中顯示的「每天最多配對 3 人」提示屬於 **Phase 4**，目前不需要實作

## Phase 1: 自由貼文 CRUD（真實資料）

### ✅ 已完成項目

- [x] **Prisma Schema**
  - ✅ 新增 `Post` 模型（id, authorId, content, imageUrl, type, createdAt, updatedAt）
  - ✅ 在 `User` 模型新增 `posts` relation
  - ✅ 建立適當的索引（authorId, createdAt, type）
  - ✅ Prisma Client 已生成

- [x] **後端 API - GET /api/posts**
  - ✅ 取得所有貼文（按時間倒序）
  - ✅ 包含 author 資訊（id, name）
  - ✅ 使用 `requireAuth` 驗證登入
  - ✅ 錯誤處理完整

- [x] **後端 API - POST /api/posts**
  - ✅ 驗證登入（`requireAuth`）
  - ✅ 接收 FormData（content, image）
  - ✅ 圖片上傳到 Vercel Blob
  - ✅ 使用 sharp 處理圖片（resize 800x800, JPEG quality 85）
  - ✅ 建立 Post 記錄
  - ✅ 回傳新建立的 post（含 author 資訊）

- [x] **前端 - 發文輸入框**
  - ✅ 文字輸入框（textarea，多行）
  - ✅ 圖片上傳按鈕（選擇檔案）
  - ✅ 圖片預覽功能
  - ✅ 移除圖片功能
  - ✅ 發佈按鈕
  - ✅ 狀態管理（content, selectedImage, imagePreview, posting）
  - ✅ 防止重複提交（posting 狀態）
  - ✅ 錯誤處理與提示

- [x] **前端 - 真實 Feed**
  - ✅ 移除假資料
  - ✅ 使用 `api.get('/posts')` 載入貼文
  - ✅ `useEffect` 在頁面載入時 fetch
  - ✅ Loading 狀態
  - ✅ 錯誤處理（401 跳轉登入，其他錯誤顯示訊息）
  - ✅ 發文成功後重新 fetch feed

- [x] **UI 樣式**
  - ✅ 像素風格 UI（border-3, shadow）
  - ✅ Feed 卡片樣式符合示意圖
  - ✅ 響應式設計（max-w-2xl, pb-24）
  - ✅ 時間戳使用相對時間

## 待執行項目

- [ ] **資料庫遷移**
  - ⚠️ 需要在有 `DATABASE_URL` 的環境下執行：
    ```bash
    cd final-project
    npx prisma migrate dev --name add_post_model
    ```
  - 或在 Vercel 部署時，`package.json` 的 build 腳本會自動執行 `prisma db push`

## 示意圖存放位置

示意圖已存放在：
```
final-project/docs/design-references/
├── wall-page-reference-1.png
├── wall-page-reference-2.png
└── README.md
```

這個位置的好處：
1. ✅ 在專案目錄內，方便版本控制
2. ✅ `docs` 資料夾清楚標示為文檔
3. ✅ 我可以直接讀取參考
4. ✅ 不會被部署到生產環境（Next.js 不會部署 `docs` 資料夾）

## 與示意圖的對比

### ✅ 符合的部分
- 像素風格 UI（粗邊框、陰影）
- Threads 風格 feed 佈局
- 發文輸入框設計
- 貼文卡片結構（頭像、名稱、時間、內容、圖片）
- 底部導航欄 W 按鈕位置

### ⚠️ 示意圖中但尚未實作（屬於後續 Phase）
- 「每日主題」區塊（Phase 2）
- 「每天最多配對 3 人」提示（Phase 4）
- 姓名隱藏邏輯（Phase 3）

## 總結

**Phase 0-1 的所有功能已完整實作！** ✅

所有核心功能都已實現：
- ✅ 導航按鈕
- ✅ Wall 頁面 UI
- ✅ 資料庫模型
- ✅ 後端 API（GET & POST）
- ✅ 前端發文功能
- ✅ 真實資料 feed

示意圖已妥善存放，可以作為後續 Phase 2-5 的設計參考。
