# Google Maps API 設定指南

## 問題解決

你遇到的 `RefererNotAllowedMapError` 錯誤是因為 Google Maps API 金鑰沒有授權你的本地開發域名。

## 解決步驟

### 1. 設定環境變數

在 `cafe-explorer-frontend` 目錄下創建 `.env` 文件：

```bash
# 在 cafe-explorer-frontend 目錄下
touch .env
```

然後在 `.env` 文件中添加：

```
VITE_GOOGLE_MAPS_JS_KEY=你的Google_Maps_API_金鑰
```

### 2. 設定 Google Cloud Console

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的專案
3. 前往 "APIs & Services" > "Credentials"
4. 找到你的 API 金鑰並點擊編輯
5. 在 "Application restrictions" 中選擇 "HTTP referrers (web sites)"
6. 添加以下網址到允許清單：

```
http://localhost:5173/*
http://localhost:5180/*
http://localhost:5183/*
http://127.0.0.1:5173/*
http://127.0.0.1:5180/*
http://127.0.0.1:5183/*
```

### 3. 確保 API 已啟用

在 Google Cloud Console 中，前往 "APIs & Services" > "Library"，確保以下 API 已啟用：

- Maps JavaScript API
- Places API

### 4. 重新啟動開發服務器

設定完成後，重新啟動前端開發服務器：

```bash
cd cafe-explorer-frontend
npm run dev
```

## 已修復的問題

✅ **重複載入 Google Maps API** - 現在使用全域載入器避免重複載入
✅ **優化載入方式** - 添加了 `loading=async` 參數
✅ **錯誤處理** - 改進了載入失敗的處理

## 測試

如果設定正確，你應該能看到：
- 地圖正常載入
- 沒有重複載入的警告
- 沒有 RefererNotAllowedMapError 錯誤
