# OAuth 登入測試檢查清單

## ✅ 已完成項目

- [x] Facebook 應用程式基本設定填寫完成
- [x] 環境變數已設置（.env.local）
- [x] NEXTAUTH_SECRET 已更新

## 📋 測試前檢查清單

### 1. 確認環境變數

執行以下命令檢查配置：
```bash
npm run debug-oauth
```

應該看到所有環境變數都是 ✅ 已設置。

### 2. 確認 OAuth Provider 後台設定

#### Google OAuth
- [ ] 前往 [Google Cloud Console](https://console.cloud.google.com/)
- [ ] 確認「已授權的重新導向 URI」包含：
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- [ ] 確認「已授權的 JavaScript 來源」包含：
  ```
  http://localhost:3000
  ```

#### GitHub OAuth
- [ ] 前往 [GitHub Developer Settings](https://github.com/settings/developers)
- [ ] 選擇 OAuth App（Client ID: `Ov23liWvIvGQUEx2h267`）
- [ ] 確認「Authorization callback URL」是：
  ```
  http://localhost:3000/api/auth/callback/github
  ```

#### Facebook OAuth
- [ ] 前往 [Facebook Developers](https://developers.facebook.com/)
- [ ] 確認應用程式處於「開發模式」
- [ ] 在「有效的 OAuth 重新導向 URI」中：
  - 如果已有 `http://localhost:3000/api/auth/callback/facebook`，可以保留
  - 或者刪除它（開發模式會自動允許 localhost）
- [ ] 確認「用戶端 OAuth 登入」和「網路 OAuth 登入」都是「是」

### 3. 重啟開發伺服器

**重要**：如果修改過 `.env.local` 或代碼，必須重啟！

```bash
# 停止當前伺服器（Ctrl+C）
# 然後重新啟動
npm run dev
```

### 4. 清除瀏覽器資料

1. 打開瀏覽器開發者工具（F12）
2. 前往 Application → Cookies
3. 刪除所有 `localhost` 相關的 cookies
4. 或使用無痕模式測試

## 🧪 測試步驟

### 測試 1: Google 登入

1. 訪問：http://localhost:3000/auth/signin
2. 點擊「使用 Google 註冊 / 登入」
3. **預期結果**：
   - ✅ 跳轉到 Google 登入頁面
   - ✅ 選擇帳號後返回應用程式
   - ✅ 導向到 `/auth/register` 頁面（首次登入）
   - ✅ 或直接登入（如果已有 session）

### 測試 2: GitHub 登入

1. 訪問：http://localhost:3000/auth/signin
2. 點擊「使用 GitHub 註冊 / 登入」
3. **預期結果**：
   - ✅ 跳轉到 GitHub 授權頁面
   - ✅ 點擊「Authorize」後返回應用程式
   - ✅ 導向到 `/auth/register` 頁面（首次登入）

### 測試 3: Facebook 登入

1. 訪問：http://localhost:3000/auth/signin
2. 點擊「使用 Facebook 註冊 / 登入」
3. **預期結果**：
   - ✅ 跳轉到 Facebook 登入頁面
   - ✅ 登入後返回應用程式
   - ✅ 導向到 `/auth/register` 頁面（首次登入）

### 測試 4: UserID 註冊流程

1. 完成 OAuth 登入後，應該會導向 `/auth/register`
2. 輸入 userID（例如：`test123`）
3. 點擊「完成註冊」
4. **預期結果**：
   - ✅ 註冊成功
   - ✅ 導向到首頁 `/`
   - ✅ 側邊欄顯示你的 userID

### 測試 5: UserID 登入流程

1. 登出（如果已登入）
2. 訪問：http://localhost:3000/auth/signin
3. 輸入之前註冊的 userID
4. 點擊「使用 userID 登入」
5. **預期結果**：
   - ✅ 自動跳轉到對應的 OAuth provider 登入頁面
   - ✅ 完成 OAuth 登入後直接登入

### 測試 6: Session 持久化

1. 完成登入
2. 關閉瀏覽器
3. 重新打開瀏覽器
4. 訪問：http://localhost:3000
5. **預期結果**：
   - ✅ 自動登入（如果 session 還在有效期內）
   - ✅ 不需要重新輸入帳號密碼

## 🐛 如果遇到錯誤

### 錯誤：Configuration

**檢查**：
1. 終端機是否有 `[NextAuth] Missing environment variables` 錯誤？
2. 是否已重啟開發伺服器？
3. 執行 `npm run debug-oauth` 檢查配置

### 錯誤：redirect_uri_mismatch

**檢查**：
1. OAuth provider 後台的 redirect URI 是否完全匹配？
2. 是否有多餘的空格或斜線？
3. 是否使用了正確的協議（http:// 或 https://）？

### 錯誤：OAuthCallback 或 OAuthSignin

**檢查**：
1. Client ID 和 Client Secret 是否正確？
2. OAuth provider 的應用程式是否已啟用？
3. 是否有權限限制？

## 📊 驗證登入成功

登入成功後，可以：

1. **檢查 Session**：
   - 訪問：http://localhost:3000/api/auth/session
   - 應該看到包含 `user` 物件的 JSON

2. **檢查資料庫**：
   ```bash
   npm run list-userids
   ```
   - 應該看到你註冊的 userID

3. **檢查側邊欄**：
   - 應該顯示你的 userID、名稱和頭像

## 🎯 下一步

如果所有測試都通過：

1. ✅ 三個 OAuth provider 都能正常登入
2. ✅ UserID 註冊流程正常
3. ✅ UserID 登入流程正常
4. ✅ Session 持久化正常

那麼 OAuth 登入功能就完全正常了！

如果還有問題，請提供：
- 具體的錯誤訊息
- 終端機的日誌
- 瀏覽器控制台的錯誤

