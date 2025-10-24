# 咖啡廳探索應用 (Cafe Explorer)

一個基於 React + TypeScript + Express 的全棧咖啡廳探索應用，整合 Google Maps 和 Places API，提供用戶認證、咖啡廳管理、地圖顯示和收藏功能。

## 功能特色

- 🔐 **用戶認證系統**：註冊、登入、JWT 身份驗證
- 🗺️ **互動地圖**：Google Maps 整合，支援點擊添加咖啡廳
- 📍 **咖啡廳管理**：CRUD 操作，支援評分和筆記
- ❤️ **收藏功能**：個人收藏列表管理
- 🔍 **地點搜尋**：整合 Google Places API
- 📱 **響應式設計**：支援桌面和移動設備
- 🛡️ **安全防護**：輸入驗證、CORS 配置、環境變數保護

## 技術棧

### 前端
- **React 18** + **TypeScript**
- **Vite** (建構工具)
- **Tailwind CSS** (樣式框架)
- **React Router** (路由管理)
- **Axios** (HTTP 客戶端)
- **Google Maps JavaScript API**

### 後端
- **Node.js** + **Express**
- **TypeScript**
- **SQLite** (資料庫)
- **JWT** (身份驗證)
- **bcrypt** (密碼加密)
- **Zod** (資料驗證)
- **CORS** (跨域配置)

### 外部服務
- **Google Maps JavaScript API** (地圖顯示)
- **Google Places API** (地點搜尋)
- **Google Geocoding API** (地址轉換)

## 專案結構

```
hw4/
├── backend/                    # 後端服務
│   ├── src/
│   │   ├── index.ts          # 主服務器文件
│   │   ├── db.ts             # 資料庫配置
│   │   ├── middleware/       # 中間件
│   │   ├── routes/           # API 路由
│   │   └── types/            # TypeScript 類型定義
│   ├── .env.example          # 環境變數範本
│   └── package.json
├── cafe-explorer-frontend/    # 前端應用
│   ├── src/
│   │   ├── components/       # React 組件
│   │   ├── pages/           # 頁面組件
│   │   ├── context/         # React Context
│   │   ├── services/        # API 服務
│   │   └── utils/           # 工具函數
│   ├── .env.example         # 環境變數範本
│   └── package.json
├── chat-history/             # 開發過程記錄
├── start-dev.sh             # 快速啟動腳本
├── port-manager.sh          # 端口管理腳本
└── README.md               # 本文件
```

## 安裝與配置

### 系統需求

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Git**

### 1. 克隆專案

```bash
git clone <repository-url>
cd hw4
```

### 2. 安裝依賴

#### 後端依賴
```bash
cd backend
npm install
```

#### 前端依賴
```bash
cd cafe-explorer-frontend
npm install
```

### 3. 環境變數配置

#### 後端配置 (`backend/.env`)

創建 `backend/.env` 文件：

```env
JWT_SECRET=your_jwt_secret_key_here_change_in_production
DATABASE_URL=./db.sqlite
GOOGLE_SERVER_KEY=your_google_places_api_server_key_here
```

#### 前端配置 (`cafe-explorer-frontend/.env`)

創建 `cafe-explorer-frontend/.env` 文件：

```env
VITE_GOOGLE_MAPS_JS_KEY=your_google_maps_js_api_key_here
VITE_API_BASE_URL=http://localhost:3000
```

### 4. Google API 配置

#### 4.1 申請 API Keys

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 啟用以下 API：
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**

#### 4.2 創建 API Keys

**Browser Key (前端用)**：
- 類型：Browser Key
- 應用程式限制：HTTP referrers
- 允許的 HTTP referrers：
  - `http://localhost:5194/*`
  - `http://127.0.0.1:5194/*`
  - 你的生產環境域名

**Server Key (後端用)**：
- 類型：Server Key
- 應用程式限制：IP 位址
- 允許的 IP 位址：你的服務器 IP

⚠️ **安全警告**：Server Key 如果未設定 IP 限制，將允許任何 IP 使用，存在安全風險。生產環境請務必設定 IP 限制。

#### 4.3 配置 API Keys

將獲得的 API Keys 分別填入對應的 `.env` 文件：

- `VITE_GOOGLE_MAPS_JS_KEY`：Browser Key
- `GOOGLE_SERVER_KEY`：Server Key

## 運行說明

### 快速啟動

使用提供的腳本快速啟動：

```bash
./start-dev.sh
```

此腳本會：
- 檢查並釋放端口 5194
- 啟動後端服務器 (端口 3000)
- 啟動前端開發服務器 (端口 5194)

### 手動啟動

#### 啟動後端
```bash
cd backend
npm run dev
```

#### 啟動前端
```bash
cd cafe-explorer-frontend
npm run dev
```

### 預設端口

- **後端**：http://localhost:3000
- **前端**：http://localhost:5194
- **健康檢查**：http://localhost:3000/health

## 測試帳號

系統提供以下測試帳號：

- **Email**: `demo@example.com`
- **Password**: `demo123`

## API 端點

### 認證端點
- `POST /auth/register` - 用戶註冊
- `POST /auth/login` - 用戶登入

### 咖啡廳管理
- `GET /api/locations` - 獲取咖啡廳列表
- `POST /api/locations` - 創建咖啡廳
- `PUT /api/locations/:id` - 更新咖啡廳
- `DELETE /api/locations/:id` - 刪除咖啡廳
- `PATCH /api/locations/:id/favorite` - 切換收藏狀態

### 搜尋功能
- `GET /api/search/places` - 搜尋地點
- `GET /api/search/places/nearby` - 附近搜尋

## 開發指南

### 資料庫初始化

首次運行時，系統會自動創建 SQLite 資料庫和必要的表格。

### 調試模式

開發模式下，系統會輸出詳細的調試日誌，包括：
- API 請求/響應
- 資料庫操作
- 錯誤信息

### 端口管理

如果遇到端口衝突，可以使用：

```bash
./port-manager.sh check    # 檢查端口使用情況
./port-manager.sh free     # 釋放特定端口
./port-manager.sh free-all # 釋放所有相關端口
```

## 已知問題與限制

1. **Google Maps API 限制**：需要有效的 API Key 和正確的 referrer 設定
2. **CORS 配置**：開發環境已配置多個端口支援
3. **資料庫**：使用 SQLite，適合開發和小型部署
4. **認證**：JWT token 無自動刷新機制

## 安全注意事項

1. **環境變數**：確保 `.env` 文件不被提交到版本控制
2. **API Keys**：定期輪換 API Keys，設定適當的限制
3. **JWT Secret**：使用強隨機密鑰，定期更換
4. **CORS**：生產環境請設定具體的允許來源

## 故障排除

### 常見問題

1. **CORS 錯誤**：檢查後端 CORS 配置是否包含前端 URL
2. **Google Maps 不顯示**：檢查 API Key 和 referrer 設定
3. **搜尋功能失敗**：確認 Places API 已啟用且 Server Key 正確
4. **端口衝突**：使用 `./port-manager.sh` 釋放端口

### 調試步驟

1. 檢查瀏覽器控制台錯誤
2. 查看後端日誌輸出
3. 驗證環境變數配置
4. 確認 API Keys 權限設定

## 授權資訊

本專案為學術作業用途，使用以下開源技術：

- React (MIT License)
- Express (MIT License)
- TypeScript (Apache License 2.0)
- Tailwind CSS (MIT License)

## 開發記錄

完整的開發過程記錄請參考 `chat-history/` 目錄。

---

**注意**：本專案包含敏感配置信息，請確保在提交前清理所有 API Keys 和密鑰信息。