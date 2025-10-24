# wp-repo-template-1141
NTU Web Programming 114-1 GitHub repo template

## 作業目錄

- [hw1/](hw1/) - 作業一
- [hw2/](hw2/) - 作業二  
- [hw3/](hw3/) - 作業三
- [hw4/](hw4/) - 作業四：咖啡廳探索應用

## 作業四：咖啡廳探索應用 (Cafe Explorer)

一個基於 React + TypeScript + Express 的全棧咖啡廳探索應用，整合 Google Maps 和 Places API，提供用戶認證、咖啡廳管理、地圖顯示和收藏功能。

### 功能特色

- 🔐 **用戶認證系統**：註冊、登入、JWT 身份驗證
- 🗺️ **互動地圖**：Google Maps 整合，支援點擊添加咖啡廳
- 📍 **咖啡廳管理**：CRUD 操作，支援評分和筆記
- ❤️ **收藏功能**：個人收藏列表管理
- 🔍 **地點搜尋**：整合 Google Places API
- 📱 **響應式設計**：支援桌面和移動設備
- 🛡️ **安全防護**：輸入驗證、CORS 配置、環境變數保護
- 📊 **效能監控**：實時效能監控儀表板，快取機制，防抖動優化

### 技術棧

**前端**：React 18 + TypeScript + Vite + Tailwind CSS + Google Maps JavaScript API
**後端**：Node.js + Express + TypeScript + SQLite + JWT + bcrypt
**外部服務**：Google Maps JavaScript API + Google Places API + Google Geocoding API

### 快速開始

1. 進入 hw4 目錄：`cd hw4`
2. 安裝依賴：`cd backend && npm install && cd ../cafe-explorer-frontend && npm install`
3. 配置環境變數（參考 `hw4/README.md`）
4. 啟動應用：`./start-dev.sh`

詳細說明請參考 [hw4/README.md](hw4/README.md)
