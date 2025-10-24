# Google Maps API 診斷指南

## 🔍 步驟 1: 檢查瀏覽器控制台錯誤

1. **開啟 Chrome DevTools** (F12 或右鍵 > 檢查)
2. **切換到 "Console" 標籤**
3. **搜尋以下錯誤類型**:

### 常見錯誤及解決方案：

| 錯誤類型 | 原因 | 解決方案 |
|---------|------|---------|
| `InvalidKeyMapError` | API Key 無效 | 檢查 Google Cloud Console 中的 Key |
| `MissingKeyMapError` | 缺少 API Key | 設置 `VITE_GOOGLE_MAPS_JS_KEY` 環境變數 |
| `RefererNotAllowedMapError` | 域名未授權 | 在 Google Cloud Console 添加 localhost 到允許清單 |
| `QuotaExceededError` | 超出配額 | 檢查 API 使用量或升級計費 |
| `RequestDeniedMapError` | 請求被拒絕 | 檢查 API 是否已啟用 |

## 🔧 步驟 2: 驗證 Google API Key 設定

### 2.1 檢查 Google Cloud Console
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的專案
3. 前往 "APIs & Services" > "Credentials"

### 2.2 檢查 API Key 設定
- **Key 類型**: Browser Key (前端用)
- **應用程式限制**: HTTP 推薦人 (網站)
- **允許清單**: 添加以下網址
  ```
  http://localhost:5194/*
  http://localhost:5173/*
  http://localhost:5180/*
  http://127.0.0.1:5194/*
  http://127.0.0.1:5173/*
  ```

### 2.3 啟用必要的 API
前往 "APIs & Services" > "Library"，確保以下 API 已啟用：
- ✅ Maps JavaScript API
- ✅ Places API (如果需要搜尋功能)

### 2.4 檢查計費設定
- 確保專案已連結計費帳戶
- 即使使用免費額度，也需要設定計費

## 🛠️ 步驟 3: 檢查前端代碼

### 3.1 環境變數設定
在 `cafe-explorer-frontend/.env` 文件中：
```bash
VITE_GOOGLE_MAPS_JS_KEY=你的Google_Maps_API_金鑰
```

### 3.2 檢查 API 載入
在瀏覽器控制台運行：
```javascript
console.log('Google Maps API Key:', import.meta.env.VITE_GOOGLE_MAPS_JS_KEY);
console.log('Google Maps loaded:', typeof google !== 'undefined');
console.log('Google Maps Map:', typeof google?.maps?.Map);
```

### 3.3 測試基本載入
```javascript
// 在控制台運行
if (typeof google !== 'undefined' && google.maps) {
  console.log('✅ Google Maps API 已載入');
  console.log('Available libraries:', Object.keys(google.maps));
} else {
  console.log('❌ Google Maps API 未載入');
}
```

## 🔍 步驟 4: 其他常見修復

### 4.1 瀏覽器設定
- 確認 JavaScript 已啟用
- 清除瀏覽器緩存 (Ctrl + F5)
- 嘗試無痕模式

### 4.2 網路問題
- 關閉 VPN 或 proxy
- 檢查防火牆設定
- 確認能訪問 `https://maps.googleapis.com`

### 4.3 Chrome 擴充
- 安裝 "Google Maps Platform API Checker" 擴充
- 檢查 API 使用情況和錯誤

## 🧪 步驟 5: 測試與除錯

### 5.1 重啟服務器
```bash
# 停止所有服務
npm run stop

# 重新啟動
npm start
```

### 5.2 檢查後端日誌
查看後端控制台是否有 API 相關錯誤

### 5.3 逐步測試
1. 先測試基本地圖載入
2. 再測試標記功能
3. 最後測試搜尋功能

## 📋 快速檢查清單

- [ ] Google Cloud Console 中 API Key 設定正確
- [ ] 域名已添加到允許清單
- [ ] Maps JavaScript API 已啟用
- [ ] 計費帳戶已設定
- [ ] 前端環境變數已設置
- [ ] 瀏覽器控制台無錯誤
- [ ] 網路連接正常

## 🆘 如果仍有問題

1. **檢查 API 使用量**: Google Cloud Console > APIs & Services > Dashboard
2. **重新生成 API Key**: 刪除舊的，創建新的
3. **檢查專案設定**: 確認專案 ID 和計費設定
4. **聯繫支援**: Google Cloud 支援或課程助教

## 💡 提示

- 開發環境建議使用 `http://localhost:*` 來涵蓋所有端口
- 生產環境需要設定具體的域名
- 定期檢查 API 使用量避免超出配額
