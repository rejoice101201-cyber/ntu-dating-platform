# Google Cloud Console 設定指南

## 🚨 問題：RefererNotAllowedMapError

你的 Google Maps API Key 沒有授權 `http://localhost:5194` 域名。

## 🔧 解決步驟

### 步驟 1: 前往 Google Cloud Console

1. 打開 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的專案（或創建新專案）

### 步驟 2: 設定 API Key 限制

1. **前往憑證頁面**：
   - 左側選單 > "APIs & Services" > "Credentials"

2. **找到你的 API Key**：
   - 點擊你的 Browser Key（前端用）

3. **編輯應用程式限制**：
   - 在 "Application restrictions" 中選擇 "HTTP referrers (web sites)"
   - 在 "Website restrictions" 中添加以下網址：

   ```
   http://localhost:5194/*
   http://localhost:5173/*
   http://localhost:5180/*
   http://127.0.0.1:5194/*
   http://127.0.0.1:5173/*
   http://127.0.0.1:5180/*
   ```

4. **保存設定**：
   - 點擊 "Save" 按鈕

### 步驟 3: 檢查 API 啟用狀態

1. **前往 API 庫**：
   - 左側選單 > "APIs & Services" > "Library"

2. **搜尋並啟用**：
   - 搜尋 "Maps JavaScript API" → 點擊 → 啟用
   - 搜尋 "Places API" → 點擊 → 啟用（如果需要搜尋功能）

### 步驟 4: 檢查計費設定

1. **前往計費**：
   - 左側選單 > "Billing"

2. **確保已連結計費帳戶**：
   - 即使使用免費額度，也需要設定計費帳戶

### 步驟 5: 等待生效

- API Key 限制更改通常需要 **1-5 分鐘** 才能生效
- 清除瀏覽器緩存後重新載入頁面

## 🧪 測試步驟

1. **清除瀏覽器緩存**：
   - 按 `Ctrl + Shift + R` 強制重新載入

2. **檢查控制台**：
   - 應該不再看到 `RefererNotAllowedMapError`

3. **檢查地圖**：
   - 地圖應該正常載入和顯示

## 🔍 如果仍有問題

### 檢查 API Key 類型
- 確保使用的是 **Browser Key**（不是 Server Key）
- Server Key 用於後端，Browser Key 用於前端

### 檢查專案設定
- 確保選擇了正確的專案
- 檢查 API 使用量是否超出配額

### 重新生成 API Key
如果問題持續：
1. 刪除現有的 API Key
2. 創建新的 Browser Key
3. 重新設定限制

## 📋 快速檢查清單

- [ ] 已添加 `http://localhost:5194/*` 到允許清單
- [ ] 已添加 `http://127.0.0.1:5194/*` 到允許清單
- [ ] Maps JavaScript API 已啟用
- [ ] Places API 已啟用（如果需要）
- [ ] 計費帳戶已設定
- [ ] 等待 1-5 分鐘讓設定生效
- [ ] 清除瀏覽器緩存
- [ ] 重新載入頁面

## 💡 開發環境建議

為了避免端口變更問題，建議添加：
```
http://localhost:*/*
http://127.0.0.1:*/*
```

這樣可以涵蓋所有本地開發端口。
