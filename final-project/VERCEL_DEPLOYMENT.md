# Vercel 部署指南

## 前置準備

在部署到 Vercel 之前，您需要準備以下資訊：

## 1. MongoDB 資料庫連接字串

### 選項 A: MongoDB Atlas (推薦)
1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 註冊/登入帳號
3. 創建一個免費的 Cluster
4. 創建資料庫用戶（Database Access）
5. 設定網路存取（Network Access）- 允許所有 IP 或添加 Vercel IP
6. 取得連接字串（Connection String）
   - 格式：`mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pikabu?retryWrites=true&w=majority`

### 選項 B: 本地 MongoDB
- 不推薦用於生產環境
- 僅適用於開發測試

## 2. OAuth 應用程式設定

### Google OAuth
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 啟用 Google+ API
4. 前往「憑證」→「建立憑證」→「OAuth 用戶端 ID」
5. 應用程式類型：網頁應用程式
6. 授權的重新導向 URI：
   - 開發環境：`http://localhost:3000/api/auth/callback/google`
   - 生產環境：`https://your-domain.vercel.app/api/auth/callback/google`
7. 取得 **Client ID** 和 **Client Secret**

### Facebook OAuth
1. 前往 [Facebook Developers](https://developers.facebook.com/)
2. 創建新應用程式
3. 選擇「消費者」類型
4. 添加「Facebook 登入」產品
5. 設定：
   - 有效的 OAuth 重新導向 URI：
     - 開發環境：`http://localhost:3000/api/auth/callback/facebook`
     - 生產環境：`https://your-domain.vercel.app/api/auth/callback/facebook`
6. 取得 **App ID** 和 **App Secret**

## 3. Pusher 設定

1. 前往 [Pusher](https://pusher.com/)
2. 註冊/登入帳號
3. 創建新 Channels app
4. 選擇 Cluster（建議選擇離您最近的區域，如 `ap1` 或 `ap3`）
5. 取得以下資訊：
   - **App ID**
   - **Key** (NEXT_PUBLIC_PUSHER_APP_KEY)
   - **Secret** (PUSHER_SECRET)
   - **Cluster** (NEXT_PUBLIC_PUSHER_CLUSTER)

## 4. NextAuth Secret

生成一個隨機字串作為 AUTH_SECRET：

```bash
# 使用 OpenSSL
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Vercel 部署步驟

### 步驟 1: 準備 GitHub Repository

1. 將專案推送到 GitHub
2. 確保所有檔案都已提交

### 步驟 2: 連接 Vercel

1. 前往 [Vercel](https://vercel.com/)
2. 使用 GitHub 帳號登入
3. 點擊 "Add New..." → "Project"
4. 選擇您的 GitHub repository
5. 選擇專案目錄（如果專案在子目錄中）

### 步驟 3: 設定專案配置

在 Vercel 專案設定中：

**Framework Preset**: Next.js
**Root Directory**: `./` (或您的專案目錄)
**Build Command**: `npm run build` (預設)
**Output Directory**: `.next` (預設)
**Install Command**: `npm install` (預設)

### 步驟 4: 設定環境變數

在 Vercel Dashboard → Settings → Environment Variables 中添加：

#### 必需環境變數

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pikabu?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
AUTH_SECRET=your-generated-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_ID=your-facebook-app-id
FACEBOOK_SECRET=your-facebook-app-secret

# Pusher
NEXT_PUBLIC_PUSHER_APP_KEY=your-pusher-app-key
PUSHER_APP_ID=your-pusher-app-id
PUSHER_SECRET=your-pusher-secret
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

#### 環境變數設定說明

- **Environment**: 選擇要套用的環境
  - Production: 生產環境
  - Preview: 預覽環境（PR 分支）
  - Development: 開發環境
- 建議：所有環境變數都設定在 **Production** 和 **Preview**

### 步驟 5: 更新 OAuth Redirect URIs

部署完成後，Vercel 會提供一個網址（例如：`https://your-project.vercel.app`）

**重要**：部署後需要更新 OAuth Redirect URIs：

#### Google OAuth
1. 前往 Google Cloud Console
2. 編輯 OAuth 用戶端
3. 添加授權的重新導向 URI：
   ```
   https://your-project.vercel.app/api/auth/callback/google
   ```

#### Facebook OAuth
1. 前往 Facebook Developers
2. 編輯應用程式設定
3. 添加有效的 OAuth 重新導向 URI：
   ```
   https://your-project.vercel.app/api/auth/callback/facebook
   ```

### 步驟 6: 部署

1. 點擊 "Deploy" 按鈕
2. 等待構建完成
3. 檢查部署日誌是否有錯誤

### 步驟 7: 驗證部署

1. 訪問您的 Vercel 網址
2. 測試登入功能
3. 測試註冊流程
4. 測試配對功能
5. 測試聊天功能

## 常見問題

### Q: 構建失敗怎麼辦？

**A**: 檢查以下項目：
1. 所有環境變數是否正確設定
2. MongoDB 連接字串是否正確
3. OAuth 憑證是否正確
4. 查看 Vercel 構建日誌中的錯誤訊息

### Q: 登入後出現錯誤？

**A**: 
1. 確認 `NEXTAUTH_URL` 設定為您的 Vercel 網址
2. 確認 OAuth Redirect URIs 已正確設定
3. 檢查環境變數是否正確

### Q: Pusher 無法連接？

**A**:
1. 確認所有 Pusher 環境變數都已設定
2. 確認 Pusher Cluster 設定正確
3. 檢查瀏覽器控制台的錯誤訊息

### Q: MongoDB 連接失敗？

**A**:
1. 確認 MongoDB Atlas Network Access 允許所有 IP 或添加 Vercel IP
2. 確認資料庫用戶名和密碼正確
3. 確認連接字串格式正確

## 環境變數檢查清單

部署前請確認以下環境變數都已設定：

- [ ] `MONGODB_URI`
- [ ] `NEXTAUTH_URL`
- [ ] `AUTH_SECRET`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `FACEBOOK_ID`
- [ ] `FACEBOOK_SECRET`
- [ ] `NEXT_PUBLIC_PUSHER_APP_KEY`
- [ ] `PUSHER_APP_ID`
- [ ] `PUSHER_SECRET`
- [ ] `NEXT_PUBLIC_PUSHER_CLUSTER`

## 安全建議

1. **不要**將環境變數提交到 Git
2. 使用強密碼和隨機生成的 AUTH_SECRET
3. 定期更新 OAuth 憑證
4. 限制 MongoDB 網路存取範圍
5. 使用 Vercel 的環境變數加密功能

## 後續優化

1. 設定自訂網域
2. 啟用 Vercel Analytics
3. 設定 Vercel Cron Jobs（用於自動清理聊天室）
4. 設定錯誤監控（如 Sentry）

## 自動清理聊天室（可選）

如果需要自動清理過期聊天室，可以設定 Vercel Cron Job：

1. 在 `vercel.json` 中添加：
```json
{
  "crons": [{
    "path": "/api/chat/cleanup",
    "schedule": "0 2 * * *"
  }]
}
```

2. 在環境變數中添加：
```env
CRON_SECRET=your-cron-secret-here
```

3. 在 API Route 中驗證 `CRON_SECRET`

## 需要幫助？

如果遇到問題，請檢查：
1. Vercel 部署日誌
2. 瀏覽器控制台錯誤
3. 伺服器日誌
4. MongoDB Atlas 日誌
5. Pusher Dashboard 日誌

