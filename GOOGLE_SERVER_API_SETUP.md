# Google Server API Key 設定指南

## 🚨 問題：搜尋功能 500 錯誤

你的後端搜尋 API 需要 Google Server API Key 才能使用 Google Places API。

## 🔧 解決步驟

### 步驟 1: 創建 Google Server API Key

1. **前往 Google Cloud Console**：
   - 打開 [Google Cloud Console](https://console.cloud.google.com/)
   - 選擇你的專案

2. **創建新的 API Key**：
   - 前往 "APIs & Services" > "Credentials"
   - 點擊 "Create Credentials" > "API Key"
   - 選擇 "Server Key" 類型

3. **設定 API Key 限制**：
   - 點擊你剛創建的 API Key
   - 在 "Application restrictions" 中選擇 "IP addresses (web servers, cron jobs, etc.)"
   - 添加你的服務器 IP 地址，或暫時留空（開發環境）
   - 在 "API restrictions" 中選擇 "Restrict key"
   - 啟用以下 API：
     - ✅ Places API
     - ✅ Maps JavaScript API

### 步驟 2: 更新後端環境變數

1. **編輯後端 `.env` 文件**：
   ```bash
   cd /home/denny/下載/網路服務程式設計/wp1141/hw4/backend
   nano .env
   ```

2. **更新 `GOOGLE_SERVER_KEY`**：
   ```
   JWT_SECRET=your_jwt_secret_key_here
   DATABASE_URL=./db.sqlite
   GOOGLE_SERVER_KEY=你的Google_Server_API_金鑰
   ```

3. **保存文件並重啟後端**：
   ```bash
   # 停止後端服務器 (Ctrl+C)
   # 重新啟動
   npm run dev
   ```

### 步驟 3: 測試搜尋功能

1. **重啟後端服務器**
2. **在前端測試搜尋**：
   - 在地圖上搜尋 "葉子" 或其他咖啡廳
   - 檢查控制台是否還有 500 錯誤

## 🔍 驗證設定

### 檢查後端日誌
後端控制台應該顯示：
```
🚀 Server running on port 3000
📊 Health check: http://localhost:3000/health
🔐 Auth endpoints: http://localhost:3000/auth
📍 Location endpoints: http://localhost:3000/api/locations
🔍 Search endpoints: http://localhost:3000/api/search
```

### 測試 API 端點
在瀏覽器中訪問：
```
http://localhost:3000/api/search/places?query=咖啡&lat=25.033&lng=121.5654&radius=1000
```

應該返回 JSON 格式的搜尋結果。

## 🚨 常見問題

### 1. API Key 無效
- 檢查 Google Cloud Console 中的 API Key 是否正確
- 確保已啟用 Places API

### 2. 超出配額
- 檢查 Google Cloud Console > APIs & Services > Dashboard
- 查看 API 使用量

### 3. 權限問題
- 確保 API Key 有權限訪問 Places API
- 檢查 IP 限制設定

## 💡 開發環境建議

為了方便開發，建議：
1. **暫時不設定 IP 限制**（僅開發環境）
2. **設定 API 限制**，只允許必要的 API
3. **定期檢查使用量**，避免超出免費配額

## 📋 快速檢查清單

- [ ] 已創建 Google Server API Key
- [ ] 已啟用 Places API
- [ ] 已更新後端 `.env` 文件
- [ ] 已重啟後端服務器
- [ ] 搜尋功能正常工作
- [ ] 無 500 錯誤

## 🔗 相關連結

- [Google Cloud Console](https://console.cloud.google.com/)
- [Places API 文檔](https://developers.google.com/maps/documentation/places/web-service)
- [API Key 最佳實踐](https://developers.google.com/maps/api-key-best-practices)
