# OAuth 登入錯誤修復指南

## 當前問題

1. **Google/Facebook**: Configuration 錯誤
2. **GitHub**: redirect_uri 未在 GitHub OAuth App 中配置

## 修復步驟

### 步驟 1: 確認環境變數已更新

`.env.local` 中的 `NEXTAUTH_SECRET` 應該已經更新為：
```env
NEXTAUTH_SECRET="zKOtP/20azg62Iu9q8rZIG3nz8nS9Ms64UxuH4EBcww="
```

### 步驟 2: 重啟開發伺服器

**重要**：更新 `.env.local` 後必須重啟開發伺服器！

1. 停止當前伺服器（按 `Ctrl+C`）
2. 重新啟動：
   ```bash
   npm run dev
   ```

### 步驟 3: 配置 GitHub OAuth App

根據錯誤訊息，GitHub 的 redirect URI 未正確配置：

1. 前往 [GitHub Developer Settings](https://github.com/settings/developers)
2. 選擇你的 OAuth App（Client ID: `Ov23liWvIvGQUEx2h267`）
3. 在 **Authorization callback URL** 欄位中，**必須**添加：
   ```
   http://localhost:3000/api/auth/callback/github
   ```
4. 點擊 **Update application** 儲存

### 步驟 4: 確認所有 OAuth Provider 的 Redirect URI

#### Google OAuth
- 前往 [Google Cloud Console](https://console.cloud.google.com/)
- 選擇專案 → **API 和服務** → **憑證**
- 編輯 OAuth 2.0 用戶端 ID
- **已授權的重新導向 URI** 必須包含：
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- **已授權的 JavaScript 來源** 必須包含：
  ```
  http://localhost:3000
  ```

#### GitHub OAuth
- 前往 [GitHub Developer Settings](https://github.com/settings/developers)
- 選擇你的 OAuth App
- **Authorization callback URL** 必須是：
  ```
  http://localhost:3000/api/auth/callback/github
  ```

#### Facebook OAuth
- 前往 [Facebook Developers](https://developers.facebook.com/)
- 選擇應用程式（App ID: `25992336197022125`）
- 前往 **Facebook Login** → **Settings**
- **Valid OAuth Redirect URIs** 必須包含：
  ```
  http://localhost:3000/api/auth/callback/facebook
  ```

### 步驟 5: 驗證配置

執行 debug 腳本檢查配置：
```bash
npm run debug-oauth
```

### 步驟 6: 清除瀏覽器資料

1. 清除 localhost 的 cookies
2. 清除瀏覽器快取（可選）
3. 重新嘗試登入

## 常見問題

### Q: 為什麼更新了 `.env.local` 還是出現 Configuration 錯誤？

**A**: 必須重啟開發伺服器！Next.js 只在啟動時讀取環境變數。

### Q: GitHub 顯示 "redirect_uri is not associated with this application"

**A**: 這表示 GitHub OAuth App 的 **Authorization callback URL** 沒有正確設置。請按照步驟 3 配置。

### Q: 所有 provider 都顯示 Configuration 錯誤

**A**: 檢查：
1. `.env.local` 檔案是否存在且格式正確
2. 開發伺服器是否已重啟
3. 終端機是否有錯誤訊息（特別是 `[NextAuth] Missing environment variables`）

## 測試順序

1. ✅ 確認 `.env.local` 正確
2. ✅ 重啟開發伺服器
3. ✅ 配置 GitHub redirect URI
4. ✅ 清除瀏覽器 cookies
5. ✅ 測試 Google 登入
6. ✅ 測試 GitHub 登入
7. ✅ 測試 Facebook 登入

## 如果問題仍然存在

請提供：
1. 終端機的完整錯誤日誌（特別是 `[NextAuth]` 開頭的訊息）
2. 執行 `npm run debug-oauth` 的輸出
3. 瀏覽器 Network 分頁中失敗請求的 Response 內容

