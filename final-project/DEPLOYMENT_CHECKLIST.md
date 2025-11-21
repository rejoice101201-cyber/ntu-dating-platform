# 部署檢查清單

## 部署前準備

### 1. 環境變數收集

請準備以下資訊：

#### MongoDB
- [ ] MongoDB Atlas 帳號
- [ ] Cluster 連接字串
- [ ] 資料庫用戶名和密碼
- [ ] 網路存取已設定（允許所有 IP 或 Vercel IP）

#### Google OAuth
- [ ] Google Cloud Console 專案
- [ ] Client ID
- [ ] Client Secret
- [ ] Redirect URI（部署後更新）

#### Facebook OAuth
- [ ] Facebook Developers 應用程式
- [ ] App ID
- [ ] App Secret
- [ ] Redirect URI（部署後更新）

#### Pusher
- [ ] Pusher 帳號
- [ ] App ID
- [ ] App Key (NEXT_PUBLIC_PUSHER_APP_KEY)
- [ ] App Secret
- [ ] Cluster 名稱

#### NextAuth
- [ ] 生成的 AUTH_SECRET（32 字元以上隨機字串）

### 2. 代碼準備

- [ ] 所有代碼已提交到 Git
- [ ] 已推送到 GitHub
- [ ] `.env.local` 已加入 `.gitignore`
- [ ] 沒有硬編碼的敏感資訊

### 3. 測試

- [ ] 本地構建成功：`npm run build`
- [ ] 本地運行正常：`npm run dev`
- [ ] 基本功能測試通過

## Vercel 部署步驟

### 步驟 1: 連接 GitHub
- [ ] 登入 Vercel
- [ ] 連接 GitHub 帳號
- [ ] 選擇 Repository
- [ ] 選擇專案目錄

### 步驟 2: 設定環境變數
- [ ] 添加 `MONGODB_URI`
- [ ] 添加 `NEXTAUTH_URL`（先設為 `https://your-project.vercel.app`，部署後更新）
- [ ] 添加 `AUTH_SECRET`
- [ ] 添加 `GOOGLE_CLIENT_ID`
- [ ] 添加 `GOOGLE_CLIENT_SECRET`
- [ ] 添加 `FACEBOOK_ID`
- [ ] 添加 `FACEBOOK_SECRET`
- [ ] 添加 `NEXT_PUBLIC_PUSHER_APP_KEY`
- [ ] 添加 `PUSHER_APP_ID`
- [ ] 添加 `PUSHER_SECRET`
- [ ] 添加 `NEXT_PUBLIC_PUSHER_CLUSTER`

### 步驟 3: 部署
- [ ] 點擊 Deploy
- [ ] 等待構建完成
- [ ] 記錄部署的網址

### 步驟 4: 更新 OAuth Redirect URIs
- [ ] 更新 Google OAuth Redirect URI
- [ ] 更新 Facebook OAuth Redirect URI
- [ ] 更新 Vercel 中的 `NEXTAUTH_URL` 為實際網址

### 步驟 5: 驗證
- [ ] 訪問部署的網址
- [ ] 測試 Google 登入
- [ ] 測試 Facebook 登入
- [ ] 測試註冊流程
- [ ] 測試配對功能
- [ ] 測試聊天功能

## 快速參考

### 生成 AUTH_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 環境變數模板

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pikabu?retryWrites=true&w=majority
NEXTAUTH_URL=https://your-project.vercel.app
AUTH_SECRET=your-generated-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_ID=your-facebook-app-id
FACEBOOK_SECRET=your-facebook-app-secret
NEXT_PUBLIC_PUSHER_APP_KEY=your-pusher-app-key
PUSHER_APP_ID=your-pusher-app-id
PUSHER_SECRET=your-pusher-secret
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

### OAuth Redirect URIs 格式

**Google:**
```
https://your-project.vercel.app/api/auth/callback/google
```

**Facebook:**
```
https://your-project.vercel.app/api/auth/callback/facebook
```

