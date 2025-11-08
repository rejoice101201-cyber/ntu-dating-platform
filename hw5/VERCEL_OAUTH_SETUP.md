# Vercel 部署 OAuth 設定指南

## 生產環境 URL

根據你的部署，生產環境 URL 應該是：
```
https://wp1141-azure.vercel.app
```

## 需要設置的環境變數（Vercel）

在 Vercel Dashboard → Settings → Environment Variables 中，確保以下環境變數都已設置：

### 必需的環境變數

```env
# Google OAuth
GOOGLE_CLIENT_ID=你的_Google_Client_ID
GOOGLE_CLIENT_SECRET=你的_Google_Client_Secret

# GitHub OAuth
GITHUB_ID=你的_GitHub_Client_ID
GITHUB_SECRET=你的_GitHub_Client_Secret

# Facebook OAuth
FACEBOOK_ID=你的_Facebook_App_ID
FACEBOOK_SECRET=你的_Facebook_App_Secret

# NextAuth 密鑰
AUTH_SECRET=你的_AUTH_SECRET
# 或使用舊名稱
NEXTAUTH_SECRET=你的_NEXTAUTH_SECRET

# NextAuth URL（重要！）
NEXTAUTH_URL=https://wp1141-azure.vercel.app
```

## OAuth Provider 設定

### 1. Google OAuth 設定

**步驟：**
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的專案
3. 前往 **API 和服務** → **憑證**
4. 找到你的 OAuth 2.0 用戶端 ID，點擊編輯（鉛筆圖標）

**需要添加的 Redirect URI：**
```
https://wp1141-azure.vercel.app/api/auth/callback/google
```

**需要添加的 JavaScript 來源：**
```
https://wp1141-azure.vercel.app
```

**設定位置：**
- **已授權的重新導向 URI** → 添加上述 URI
- **已授權的 JavaScript 來源** → 添加上述 URL
- 點擊 **儲存**

---

### 2. GitHub OAuth 設定

**步驟：**
1. 前往 [GitHub Developer Settings](https://github.com/settings/developers)
2. 選擇你的 OAuth App（或創建新的）
3. 點擊 **Edit** 按鈕

**需要設置的 Authorization callback URL：**
```
https://wp1141-azure.vercel.app/api/auth/callback/github
```

**設定位置：**
- **Authorization callback URL** → 輸入上述 URL
- 點擊 **Update application**

**注意：** GitHub 只允許一個 callback URL，所以如果你同時需要開發環境，可以：
- 使用不同的 OAuth App 用於開發和生產
- 或者每次切換時手動更新

---

### 3. Facebook OAuth 設定

**步驟：**
1. 前往 [Facebook Developers](https://developers.facebook.com/)
2. 選擇你的應用程式
3. 前往 **Facebook Login** → **Settings**

**需要添加的 Valid OAuth Redirect URIs：**
```
https://wp1141-azure.vercel.app/api/auth/callback/facebook
```

**設定位置：**
- **有效的 OAuth 重新導向 URI** → 添加上述 URI（每行一個）
- 確認以下設定：
  - **用戶端 OAuth 登入**：設為「是」
  - **網路 OAuth 登入**：設為「是」
  - **強制採用 HTTPS**：設為「是」（生產環境必須）
- 點擊 **儲存變更**

---

## 檢查清單

### Vercel 環境變數檢查
- [ ] `GOOGLE_CLIENT_ID` 已設置
- [ ] `GOOGLE_CLIENT_SECRET` 已設置
- [ ] `GITHUB_ID` 已設置
- [ ] `GITHUB_SECRET` 已設置
- [ ] `FACEBOOK_ID` 已設置
- [ ] `FACEBOOK_SECRET` 已設置
- [ ] `AUTH_SECRET` 或 `NEXTAUTH_SECRET` 已設置
- [ ] `NEXTAUTH_URL` 設置為 `https://wp1141-azure.vercel.app`

### Google OAuth 檢查
- [ ] Redirect URI: `https://wp1141-azure.vercel.app/api/auth/callback/google`
- [ ] JavaScript 來源: `https://wp1141-azure.vercel.app`
- [ ] 已點擊儲存

### GitHub OAuth 檢查
- [ ] Callback URL: `https://wp1141-azure.vercel.app/api/auth/callback/github`
- [ ] 已點擊 Update application

### Facebook OAuth 檢查
- [ ] Redirect URI: `https://wp1141-azure.vercel.app/api/auth/callback/facebook`
- [ ] 用戶端 OAuth 登入：是
- [ ] 網路 OAuth 登入：是
- [ ] 強制採用 HTTPS：是
- [ ] 已點擊儲存變更

---

## 更新後的重要步驟

1. **重新部署 Vercel**
   - 在 Vercel Dashboard 中，點擊 **Deployments**
   - 找到最新的部署，點擊 **Redeploy**（如果環境變數有更新）

2. **清除瀏覽器快取**
   - 使用無痕模式測試
   - 或清除 cookies 和快取

3. **測試登入**
   - 訪問：`https://wp1141-azure.vercel.app/auth/signin`
   - 測試每個 OAuth provider

---

## 常見問題

### Q: 為什麼還是出現 server error？

**A:** 可能的原因：
1. **環境變數未更新**：確認 Vercel 中的環境變數都已正確設置
2. **Redirect URI 不匹配**：確認 OAuth provider 後台的 URI 與 `NEXTAUTH_URL` 一致
3. **未重新部署**：更新環境變數後需要重新部署
4. **快取問題**：清除瀏覽器快取或使用無痕模式

### Q: 如何確認 NEXTAUTH_URL 是否正確？

**A:** 在 Vercel Dashboard：
1. 前往 Settings → Environment Variables
2. 確認 `NEXTAUTH_URL` 的值是 `https://wp1141-azure.vercel.app`
3. 如果沒有，添加它並重新部署

### Q: 開發環境和生產環境可以共用同一個 OAuth App 嗎？

**A:** 
- **Google**: 可以，在同一個 OAuth App 中添加多個 Redirect URI
- **GitHub**: 不可以，每個 OAuth App 只能有一個 Callback URL
- **Facebook**: 可以，在同一個 App 中添加多個 Redirect URI

建議為開發和生產環境使用不同的 OAuth App。

---

## 快速參考：所有 Redirect URI

### 生產環境（Vercel）
```
Google:   https://wp1141-azure.vercel.app/api/auth/callback/google
GitHub:   https://wp1141-azure.vercel.app/api/auth/callback/github
Facebook: https://wp1141-azure.vercel.app/api/auth/callback/facebook
```

### 開發環境（本地）
```
Google:   http://localhost:3000/api/auth/callback/google
GitHub:   http://localhost:3000/api/auth/callback/github
Facebook: http://localhost:3000/api/auth/callback/facebook
```

