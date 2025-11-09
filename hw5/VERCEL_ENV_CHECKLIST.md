# Vercel 環境變數檢查清單

## 生產環境 URL

```
https://wp1141-azure.vercel.app
```

## 必需的環境變數

在 Vercel Dashboard → Settings → Environment Variables 中，確保以下環境變數都已設置：

### OAuth Providers

#### Google OAuth
```env
GOOGLE_CLIENT_ID=你的_Google_Client_ID
GOOGLE_CLIENT_SECRET=你的_Google_Client_Secret
```

#### GitHub OAuth
```env
GITHUB_ID=你的_GitHub_Client_ID
GITHUB_SECRET=你的_GitHub_Client_Secret
```

#### Facebook OAuth
```env
FACEBOOK_ID=你的_Facebook_App_ID
FACEBOOK_SECRET=你的_Facebook_App_Secret
```

### NextAuth 配置

```env
AUTH_SECRET=你的_AUTH_SECRET
NEXTAUTH_URL=https://wp1141-azure.vercel.app
```

**重要**：
- `AUTH_SECRET` 是 NextAuth v5 的標準名稱（優先使用）
- 如果使用 `NEXTAUTH_SECRET`，代碼會自動 fallback，但建議統一使用 `AUTH_SECRET`
- `NEXTAUTH_URL` 必須設置為生產環境 URL：`https://wp1141-azure.vercel.app`

### 資料庫

```env
DATABASE_URL=你的_PostgreSQL_連接字符串
```

### Pusher（可選，用於即時更新）

```env
NEXT_PUBLIC_PUSHER_APP_KEY=你的_Pusher_App_Key
NEXT_PUBLIC_PUSHER_CLUSTER=你的_Pusher_Cluster
PUSHER_APP_ID=你的_Pusher_App_ID
PUSHER_SECRET=你的_Pusher_Secret
```

## 環境變數設置規則

### 1. 環境選擇

**重要**：所有環境變數都必須設置在 **Production** 環境！

在 Vercel Dashboard 中：
- 選擇 "Production" 環境
- 或者選擇 "Production, Preview, Development" 以在所有環境中使用

### 2. 格式要求

- **不要使用引號**：值不應該包含引號（除非值本身包含空格）
- **不要有多餘空格**：確保值前後沒有空格
- **正確的格式**：
  ```
  ✅ 正確：GOOGLE_CLIENT_ID=1088877093625-dpib8e5k8p18v1n5gpfc6vap4sj6lnth.apps.googleusercontent.com
  ❌ 錯誤：GOOGLE_CLIENT_ID="1088877093625-dpib8e5k8p18v1n5gpfc6vap4sj6lnth.apps.googleusercontent.com"
  ❌ 錯誤：GOOGLE_CLIENT_ID = 1088877093625-dpib8e5k8p18v1n5gpfc6vap4sj6lnth.apps.googleusercontent.com
  ```

### 3. 變數名稱檢查

確保變數名稱拼寫正確：
- ✅ `GOOGLE_CLIENT_ID`（不是 `GOOGLE_CLIENTID`）
- ✅ `GITHUB_ID`（不是 `GITHUB_CLIENT_ID`）
- ✅ `AUTH_SECRET`（優先使用，不是 `NEXTAUTH_SECRET`）
- ✅ `NEXTAUTH_URL`（不是 `NEXT_PUBLIC_NEXTAUTH_URL`）

## 驗證步驟

### 步驟 1：檢查 Vercel Dashboard

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇你的專案：`wp1141`
3. 前往 **Settings** → **Environment Variables**
4. 確認所有必需的環境變數都已設置
5. 確認所有變數都設置在 **Production** 環境

### 步驟 2：檢查部署日誌

部署後，檢查 Vercel Function Logs，應該看到：

```
[NextAuth] AUTH_SECRET is set (length: 44)
[NextAuth] Enabled providers: [ 'google', 'github', 'facebook' ]
[NextAuth] Successfully configured 3 OAuth provider(s)
```

如果看到：
```
[NextAuth] WARNING: No OAuth providers configured!
[NextAuth] Missing environment variables: [ 'GOOGLE_CLIENT_ID', ... ]
```

這表示環境變數未正確設置。

### 步驟 3：測試 OAuth 登入

1. 訪問：`https://wp1141-azure.vercel.app/auth/signin`
2. 點擊 "Sign up with Google"
3. 應該成功跳轉到 Google 授權頁面
4. 授權後應該成功返回並創建 session

## 常見問題

### Q: 為什麼 OAuth 登入失敗？

**A:** 可能的原因：
1. **環境變數未設置**：檢查 Vercel Dashboard 中的環境變數
2. **環境變數設置在錯誤的環境**：確保設置在 Production 環境
3. **變數名稱拼寫錯誤**：檢查變數名稱是否正確
4. **值包含引號**：移除值中的引號
5. **未重新部署**：更新環境變數後需要重新部署

### Q: 如何確認環境變數是否正確設置？

**A:** 
1. 檢查 Vercel Function Logs 中的 `[NextAuth]` 日誌
2. 如果看到 `[NextAuth] Enabled providers: [ 'google', 'github', 'facebook' ]`，表示環境變數正確
3. 如果看到 `[NextAuth] WARNING: No OAuth providers configured!`，表示環境變數有問題

### Q: 更新環境變數後需要做什麼？

**A:**
1. 在 Vercel Dashboard 中更新環境變數
2. 前往 **Deployments** 頁面
3. 選擇最新的部署
4. 點擊 **Redeploy** 重新部署

### Q: 本地開發和生產環境可以使用不同的 OAuth App 嗎？

**A:** 
- **Google**: 可以，在同一個 OAuth App 中添加多個 Redirect URI
- **GitHub**: 不可以，每個 OAuth App 只能有一個 Callback URL（建議使用不同的 OAuth App）
- **Facebook**: 可以，在同一個 App 中添加多個 Redirect URI

建議為開發和生產環境使用不同的 OAuth App。

## OAuth Provider 後台設置

### Google OAuth

**Redirect URI**：
```
https://wp1141-azure.vercel.app/api/auth/callback/google
```

**JavaScript 來源**：
```
https://wp1141-azure.vercel.app
```

### GitHub OAuth

**Authorization callback URL**：
```
https://wp1141-azure.vercel.app/api/auth/callback/github
```

### Facebook OAuth

**Valid OAuth Redirect URIs**：
```
https://wp1141-azure.vercel.app/api/auth/callback/facebook
```

## 快速檢查清單

- [ ] 所有環境變數都已設置在 Vercel Dashboard
- [ ] 所有變數都設置在 **Production** 環境
- [ ] `AUTH_SECRET` 已設置（或 `NEXTAUTH_SECRET`）
- [ ] `NEXTAUTH_URL` 設置為 `https://wp1141-azure.vercel.app`
- [ ] 所有 OAuth provider 的環境變數都已設置
- [ ] 環境變數值沒有引號（除非值包含空格）
- [ ] 變數名稱拼寫正確
- [ ] OAuth provider 後台的 Redirect URI 已正確設置
- [ ] 更新環境變數後已重新部署
- [ ] 檢查 Vercel Function Logs 確認環境變數狀態

