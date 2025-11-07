# OAuth 登入錯誤 Debug 指南

## 快速檢查步驟

### 1. 執行 Debug 腳本

```bash
npm run debug-oauth
```

這會檢查：
- 環境變數是否正確設置
- 資料庫連線是否正常
- 預期的 redirect URI

### 2. 檢查錯誤訊息

當你點擊 OAuth 按鈕後，請提供以下資訊：

#### a) 錯誤頁面顯示的錯誤類型
- 訪問 `/auth/error` 頁面時，URL 中的 `error` 參數是什麼？
- 例如：`/auth/error?error=OAuthCallback`

#### b) 瀏覽器控制台錯誤
1. 打開瀏覽器開發者工具（F12）
2. 切換到 **Console** 分頁
3. 點擊 OAuth 按鈕
4. 複製所有紅色錯誤訊息

#### c) 終端機伺服器日誌
1. 查看運行 `npm run dev` 的終端機
2. 點擊 OAuth 按鈕
3. 複製所有錯誤訊息（特別是包含 `[NextAuth]` 的日誌）

#### d) 網路請求詳情
1. 打開瀏覽器開發者工具（F12）
2. 切換到 **Network** 分頁
3. 點擊 OAuth 按鈕
4. 找到失敗的請求（通常是 `/api/auth/callback/*` 或 `/api/auth/signin/*`）
5. 點擊該請求，查看：
   - **Headers** 分頁
   - **Response** 分頁（如果有錯誤訊息）

### 3. 常見錯誤及解決方法

#### 錯誤：`redirect_uri_mismatch`
**原因**：OAuth provider 後台設置的 redirect URI 與實際不符

**解決方法**：
1. 確認 `NEXTAUTH_URL` 環境變數正確（例如：`http://localhost:3000`）
2. 在各 OAuth provider 後台設置正確的 redirect URI：
   - Google: `http://localhost:3000/api/auth/callback/google`
   - GitHub: `http://localhost:3000/api/auth/callback/github`
   - Facebook: `http://localhost:3000/api/auth/callback/facebook`
3. 確保沒有多餘的斜線或空格

#### 錯誤：`Configuration`
**原因**：環境變數未設置或格式錯誤

**解決方法**：
1. 檢查 `.env.local` 檔案是否存在
2. 確認所有 OAuth 相關環境變數都已設置
3. 重啟開發伺服器（`npm run dev`）

#### 錯誤：`OAuthCallback` 或 `OAuthSignin`
**原因**：OAuth provider 認證失敗

**解決方法**：
1. 確認 Client ID 和 Client Secret 正確
2. 檢查 OAuth provider 後台的應用程式狀態（是否已啟用）
3. 確認 OAuth provider 的 API 權限已正確設置

#### 錯誤：資料庫相關錯誤
**原因**：資料庫連線或 schema 問題

**解決方法**：
1. 確認 `DATABASE_URL` 正確
2. 運行 `npx prisma migrate dev` 確保資料庫 schema 是最新的
3. 運行 `npx prisma generate` 重新生成 Prisma Client

### 4. 提供給開發者的資訊

當你遇到錯誤時，請提供：

1. **錯誤類型**：錯誤頁面 URL 中的 `error` 參數
2. **環境變數檢查結果**：執行 `npm run debug-oauth` 的輸出
3. **瀏覽器控制台錯誤**：完整的錯誤訊息
4. **伺服器日誌**：終端機中的錯誤訊息
5. **網路請求詳情**：失敗請求的 Response 內容
6. **使用的 OAuth provider**：Google / GitHub / Facebook（或全部）

### 5. 測試步驟

1. 清除瀏覽器 cookies（特別是 localhost 相關的）
2. 重啟開發伺服器
3. 確認 `.env.local` 檔案存在且內容正確
4. 執行 `npm run debug-oauth` 檢查配置
5. 嘗試登入並記錄所有錯誤訊息

