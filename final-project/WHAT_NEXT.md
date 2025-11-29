# 接下來可以設定什麼？

## ✅ 已完成的基本設定

- [x] Vercel 專案部署
- [x] Google OAuth 設定
- [x] MongoDB 連接設定
- [x] 基本環境變數設定

## 🎯 接下來的設定選項（按優先順序）

### 優先級 1: 測試基本功能 ⭐⭐⭐

在添加更多功能之前，先確認現有功能正常運作：

#### 測試步驟

1. **測試 Google 登入**
   - 訪問：https://ntu-dating-platform-kappa.vercel.app
   - 點擊「使用 Google 登入」
   - 確認可以成功登入

2. **測試註冊流程**
   - 登入後應該會跳轉到註冊頁面
   - 輸入 userID（例如：`test_user_123`）
   - 上傳至少 1 張照片
   - 點擊「完成註冊」
   - 確認可以成功註冊

3. **測試配對頁面**
   - 註冊後應該會跳轉到配對頁面
   - 確認可以看到推薦用戶（如果資料庫中有其他用戶）
   - 測試 Like/Pass 功能

4. **驗證資料儲存**
   - 前往 MongoDB Atlas
   - 查看 `users` 集合，確認您的用戶資料已儲存
   - 查看 `accounts` 集合，確認 OAuth 帳號已連結

**如果測試成功**：可以繼續添加更多功能  
**如果測試失敗**：檢查錯誤訊息並修復問題

---

### 優先級 2: 設定 Facebook OAuth ⭐⭐

讓用戶也可以使用 Facebook 登入：

#### 設定步驟

1. **前往 Facebook Developers**
   - 訪問：https://developers.facebook.com/
   - 登入 Facebook 帳號

2. **創建應用程式**
   - 點擊 **My Apps** → **Create App**
   - 選擇 **Consumer** 類型
   - App name: `Pikabu`
   - App contact email: 您的 email
   - 點擊 **Create App**

3. **添加 Facebook 登入產品**
   - 在 Dashboard 找到 **Add Products**
   - 找到 **Facebook Login** → **Set Up**
   - 選擇 **Web** 平台

4. **設定 Redirect URI**
   - 前往 **Facebook Login** → **Settings**
   - 在 **Valid OAuth Redirect URIs** 中添加：
     ```
     https://ntu-dating-platform-kappa.vercel.app/api/auth/callback/facebook
     http://localhost:3000/api/auth/callback/facebook
     ```
   - 點擊 **Save Changes**

5. **取得 App ID 和 App Secret**
   - 前往 **Settings** → **Basic**
   - 複製 **App ID** 和 **App Secret**（點擊 Show 顯示）

6. **在 Vercel 中設定環境變數**
   - 前往 Vercel Dashboard → Settings → Environment Variables
   - 添加：
     - `FACEBOOK_ID` = 您的 App ID
     - `FACEBOOK_SECRET` = 您的 App Secret
   - Environment: Production, Preview
   - 點擊 Save

7. **重新部署**
   - Vercel Dashboard → Deployments → Redeploy

**完成後**：用戶可以使用 Facebook 登入

---

### 優先級 3: 設定 Pusher（即時聊天） ⭐⭐

讓聊天功能可以即時運作：

#### 設定步驟

1. **前往 Pusher**
   - 訪問：https://pusher.com/
   - 註冊/登入帳號

2. **創建 Channels App**
   - 點擊 **Channels apps** → **Create app**
   - App name: `Pikabu Chat`
   - Cluster: 選擇離您最近的（如 `ap1` 或 `ap3`）
   - Front-end tech: React
   - Back-end tech: Node.js
   - 點擊 **Create app**

3. **取得憑證**
   - 在 App Dashboard → **App Keys** 標籤
   - 複製：
     - **App ID**
     - **Key** (NEXT_PUBLIC_PUSHER_APP_KEY)
     - **Secret** (PUSHER_SECRET)
     - **Cluster** (NEXT_PUBLIC_PUSHER_CLUSTER)

4. **在 Vercel 中設定環境變數**
   - 前往 Vercel Dashboard → Settings → Environment Variables
   - 添加：
     - `NEXT_PUBLIC_PUSHER_APP_KEY` = Key
     - `PUSHER_APP_ID` = App ID
     - `PUSHER_SECRET` = Secret
     - `NEXT_PUBLIC_PUSHER_CLUSTER` = Cluster 名稱
   - Environment: Production, Preview
   - 點擊 Save

5. **重新部署**
   - Vercel Dashboard → Deployments → Redeploy

**完成後**：配對成功的用戶可以即時聊天

---

### 優先級 4: 設定自動清理聊天室（可選） ⭐

設定定期清理過期聊天室：

#### 設定步驟

1. **在 Vercel 中設定 Cron Job**
   - 編輯 `vercel.json` 文件
   - 添加 cron 設定（見下方）

2. **添加 CRON_SECRET 環境變數**
   - 生成一個隨機字串作為 secret
   - 在 Vercel 中設定 `CRON_SECRET`

3. **更新清理 API**
   - 確保 `/api/chat/cleanup` 路由驗證 CRON_SECRET

**詳細說明**：需要修改代碼，可以稍後處理

---

## 🧪 測試建議

### 完整功能測試流程

1. **創建測試用戶**
   - 使用不同的 Google 帳號登入
   - 創建多個測試用戶（至少 2-3 個）
   - 每個用戶填寫不同的個人資料和標籤

2. **測試配對功能**
   - 使用用戶 A 查看推薦
   - 對用戶 B 點擊 Like
   - 使用用戶 B 登入，對用戶 A 點擊 Like
   - 確認雙向匹配成功

3. **測試聊天功能**（如果設定了 Pusher）
   - 配對成功後，確認可以創建聊天室
   - 測試發送訊息
   - 確認即時訊息功能正常

4. **測試照片上傳**
   - 上傳多張照片
   - 確認照片可以正常顯示
   - 確認照片 URL 正確

---

## 📊 功能完成度檢查

### 核心功能 ✅
- [x] OAuth 登入（Google）
- [x] 用戶註冊
- [x] 資料儲存（MongoDB）
- [x] 照片上傳（Vercel Blob）
- [x] 配對系統
- [x] 聊天室系統

### 可選功能
- [ ] Facebook OAuth 登入
- [ ] 即時聊天（Pusher）
- [ ] 自動清理聊天室（Cron Job）

### 優化項目
- [ ] 推薦算法優化
- [ ] UI/UX 改進
- [ ] 錯誤處理改進
- [ ] 載入狀態優化
- [ ] 移動端體驗優化

---

## 🎯 建議的下一步

### 選項 A: 先測試現有功能（推薦）

1. 測試 Google 登入
2. 測試註冊流程
3. 創建多個測試用戶
4. 測試配對功能
5. 確認所有基本功能正常

**時間**：30-60 分鐘

### 選項 B: 添加 Facebook OAuth

1. 設定 Facebook Developers 應用程式
2. 在 Vercel 中設定環境變數
3. 測試 Facebook 登入

**時間**：15-20 分鐘

### 選項 C: 設定 Pusher 即時聊天

1. 創建 Pusher 應用程式
2. 在 Vercel 中設定環境變數
3. 測試即時聊天功能

**時間**：15-20 分鐘

### 選項 D: 開始添加新功能

1. 優化推薦算法
2. 添加更多標籤選項
3. 實現階段二（顯示完整照片）
4. 添加通知系統

**時間**：根據功能複雜度

---

## 📝 快速參考

### 環境變數檢查清單

#### 已設定 ✅
- `BLOB_READ_WRITE_TOKEN`
- `SHARP_IGNORE_GLOBAL_LIBVIPS`
- `JWT_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `MONGODB_URI`

#### 可選設定
- `FACEBOOK_ID` - Facebook OAuth
- `FACEBOOK_SECRET` - Facebook OAuth
- `NEXT_PUBLIC_PUSHER_APP_KEY` - Pusher
- `PUSHER_APP_ID` - Pusher
- `PUSHER_SECRET` - Pusher
- `NEXT_PUBLIC_PUSHER_CLUSTER` - Pusher

---

## 💡 建議

**最推薦的下一步**：

1. **先測試現有功能**（30 分鐘）
   - 確認所有基本功能正常運作
   - 發現並修復任何問題

2. **然後添加 Facebook OAuth**（20 分鐘）
   - 增加登入選項
   - 提升用戶體驗

3. **最後設定 Pusher**（20 分鐘）
   - 啟用即時聊天功能
   - 完成核心功能

這樣可以確保每個功能都經過測試，並且逐步完善專案。

---

## 🔗 相關文檔

- `SETUP_PROGRESS.md` - 設定進度檢查清單
- `NEXT_STEPS.md` - 詳細的下一步指南
- `VERCEL_DEPLOYMENT.md` - 完整部署指南
- `PROJECT_STATUS.md` - 專案狀態與架構

