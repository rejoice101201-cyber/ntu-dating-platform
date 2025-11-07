# Facebook OAuth 設定修正版

## 重要發現

根據 Facebook 的說明：
> **http://localhost 重新導向只會在開發模式中自動啟用，不需要在此新增。**

這表示：
1. **如果應用程式處於開發模式**，localhost 的 HTTP 重新導向會自動允許
2. **不需要手動添加** `http://localhost:3000/api/auth/callback/facebook` 到 URI 清單
3. **「強制採用 HTTPS」無法調整**是正常的（可能是因為應用程式設定或權限問題）

## 解決方案

### 方案 1: 確認應用程式處於開發模式（推薦）

1. **檢查應用程式模式**：
   - 在 Facebook Developer 後台
   - 查看應用程式的基本設定
   - 確認應用程式狀態是「開發模式」或「Development Mode」

2. **如果不在開發模式**：
   - 切換到開發模式
   - 或者添加測試用戶（如果應用程式已發布）

### 方案 2: 使用 HTTPS 的 localhost（如果方案 1 不行）

如果開發模式無法解決，可以：

1. **使用 ngrok 或類似的工具**建立 HTTPS 隧道：
   ```bash
   # 安裝 ngrok
   # 然後執行
   ngrok http 3000
   ```
   
2. **使用 ngrok 提供的 HTTPS URL**：
   - 例如：`https://abc123.ngrok.io/api/auth/callback/facebook`
   - 將此 URL 添加到「有效的 OAuth 重新導向 URI」

### 方案 3: 暫時移除 localhost URI（如果已添加）

如果「有效的 OAuth 重新導向 URI」中有 `http://localhost:3000/api/auth/callback/facebook`：

1. **刪除它**（點擊旁邊的 X）
2. **儲存變更**
3. **測試登入**（開發模式應該會自動允許）

## 檢查清單

請確認以下項目：

- [ ] 應用程式處於「開發模式」
- [ ] 如果 URI 清單中有 localhost，已刪除
- [ ] 「用戶端 OAuth 登入」設為「是」
- [ ] 「網路 OAuth 登入」設為「是」
- [ ] 已點擊「儲存變更」

## 測試步驟

1. **清除瀏覽器 cookies**
2. **重新啟動開發伺服器**（如果還在運行）
3. **嘗試 Facebook 登入**

如果還是不行，請告訴我：
- 應用程式目前的模式（開發模式/發布模式）
- 嘗試登入時的具體錯誤訊息

