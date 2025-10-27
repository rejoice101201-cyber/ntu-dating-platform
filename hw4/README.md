# 咖啡廳探索應用 (Cafe Explorer)

一個基於 React + TypeScript + Express 的全棧咖啡廳探索應用，整合 Google Maps 和 Places API，提供用戶認證、咖啡廳管理、地圖顯示和收藏功能。

## 🚀 快速啟動（評分者專用）

> 💡 **提示：如果你使用 Cursor 編輯器，可以直接請 AI 協助設定 API 金鑰**
> ```
> 請幫我設定 Google Maps API 金鑰到環境變數檔案：
> 前端key:你的Google_Maps_JavaScript_API金鑰
> 後端key:你的Google_Places_API金鑰
> ```

### 1. 安裝依賴
```bash
# 安裝後端依賴
cd backend && npm install

# 安裝前端依賴  
cd ../cafe-explorer-frontend && npm install
```

### 2. 設定 Google Maps API 金鑰

#### 📝 步驟 2.1：複製環境變數範例檔案
```bash
# 複製前端環境變數範例
cp cafe-explorer-frontend/env.example cafe-explorer-frontend/.env

# 複製後端環境變數範例
cp backend/env.example backend/.env
```

#### 🔑 步驟 2.2：取得 Google Maps API 金鑰
1. 前往 [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. 建立新專案或選擇現有專案
3. 啟用以下 API：
   - **Maps JavaScript API** (地圖顯示)
   - **Places API** (地點搜尋)
4. 建立 API 金鑰
5. 設定 API 金鑰限制（建議）：
   - HTTP referrers: `http://localhost:5173/*`
   - IP addresses: `localhost`

#### ✏️ 步驟 2.3：編輯環境變數檔案

**方法一：使用 Cursor AI 協助（推薦）**

如果你使用 Cursor 編輯器，可以直接請 AI 協助設定 API 金鑰：

```
請幫我設定 Google Maps API 金鑰到環境變數檔案：
前端key:你的Google_Maps_JavaScript_API金鑰
後端key:你的Google_Places_API金鑰
```

**方法二：手動編輯**

**編輯前端環境變數** (`cafe-explorer-frontend/.env`)：
```bash
# 使用文字編輯器開啟檔案
nano cafe-explorer-frontend/.env
# 或使用 vim
vim cafe-explorer-frontend/.env
# 或使用 VS Code
code cafe-explorer-frontend/.env
```

將以下內容替換為你的 API 金鑰：
```env
VITE_GOOGLE_MAPS_JS_KEY=你的Google_Maps_JavaScript_API金鑰
VITE_API_BASE_URL=http://localhost:3000
VITE_NODE_ENV=development
```

**編輯後端環境變數** (`backend/.env`)：
```bash
# 使用文字編輯器開啟檔案
nano backend/.env
# 或使用 vim
vim backend/.env
# 或使用 VS Code
code backend/.env
```

將以下內容替換為你的 API 金鑰：
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
GOOGLE_SERVER_KEY=你的Google_Places_API金鑰
DATABASE_PATH=./db.sqlite
NODE_ENV=development
```

#### ✅ 步驟 2.4：驗證設定
```bash
# 檢查前端環境變數
cat cafe-explorer-frontend/.env | grep VITE_GOOGLE_MAPS_JS_KEY

# 檢查後端環境變數
cat backend/.env | grep GOOGLE_SERVER_KEY
```

### 3. 啟動應用
```bash
# 回到 hw4 根目錄
cd ..

# 方法一：一鍵啟動（推薦）
npm start

# 方法二：使用快速啟動腳本
./quick-start.sh

# 方法三：分別啟動
./start-dev.sh
```

### 4. 訪問應用
- **前端**: http://localhost:5173
- **後端**: http://localhost:3000
- **健康檢查**: http://localhost:3000/health

### 5. 故障排除

#### 🚨 常見問題

**問題 1：地圖無法載入**
- 檢查 `cafe-explorer-frontend/.env` 中的 `VITE_GOOGLE_MAPS_JS_KEY` 是否正確設定
- 確認 API 金鑰已啟用 "Maps JavaScript API"
- 檢查瀏覽器控制台是否有錯誤訊息

**問題 2：搜尋功能無法使用**
- 檢查 `backend/.env` 中的 `GOOGLE_SERVER_KEY` 是否正確設定
- 確認 API 金鑰已啟用 "Places API"
- 檢查後端日誌是否有錯誤訊息

**問題 3：端口被占用**
```bash
# 清理端口
./port-manager.sh free-all

# 重新啟動
npm start
```

**問題 4：422 驗證錯誤**
- 確認 API 金鑰格式正確（39個字符，以 AIzaSy 開頭）
- 檢查環境變數檔案是否正確複製和編輯
- 重新啟動應用以載入新的環境變數

**問題 5：nano 編輯器無法正常顯示內容**
- 使用 Cursor AI 協助：直接告訴 AI 你的 API 金鑰，讓 AI 幫你設定
- 使用其他編輯器：`code cafe-explorer-frontend/.env` 或 `gedit cafe-explorer-frontend/.env`
- 使用 echo 指令直接修改檔案

#### 🔍 診斷工具
訪問 `http://localhost:5173/diagnostic` 查看詳細的 API 狀態和錯誤訊息。

## 🔑 Google Maps API 設定

### ⚠️ 重要提醒
**評分者必須置換為自己的 API 金鑰後再啟動應用，否則地圖功能將無法運作！**

### 需要的 API 金鑰

#### 1. **前端 Browser Key** (地圖顯示)
- 前往 [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
- 啟用 **"Maps JavaScript API"**
- 建立 API 金鑰
- 設定到 `cafe-explorer-frontend/.env` 的 `VITE_GOOGLE_MAPS_JS_KEY`

#### 2. **後端 Server Key** (地點搜尋)
- 在相同專案中啟用以下 API：
  - **Places API** (地點搜尋)
  - **Geocoding API** (地址轉換)
  - **Directions API** (路線規劃)
- 建立 API 金鑰
- 設定到 `backend/.env` 的 `GOOGLE_SERVER_KEY`

### 🔒 API 金鑰安全設定建議

#### Browser Key 限制
- **HTTP referrer**: `http://localhost:5173/*`
- **API 限制**: 只啟用 "Maps JavaScript API"

#### Server Key 限制
- **IP addresses**: `localhost` 或 `127.0.0.1`
- **API 限制**: 啟用 Places API、Geocoding API、Directions API
- ⚠️ **安全風險**: 若未限制 IP，Server Key 可能被濫用

### 🚀 快速設定指令

```bash
# 複製環境變數範例
cp cafe-explorer-frontend/env.example cafe-explorer-frontend/.env
cp backend/env.example backend/.env
```

**方法一：使用 Cursor AI 協助（推薦）**
```
請幫我設定 Google Maps API 金鑰到環境變數檔案：
前端key:你的Google_Maps_JavaScript_API金鑰
後端key:你的Google_Places_API金鑰
```

**方法二：手動編輯**
```bash
# 編輯前端環境變數
nano cafe-explorer-frontend/.env
# 將 YOUR_BROWSER_KEY 替換為你的 Browser Key

# 編輯後端環境變數
nano backend/.env
# 將 YOUR_SERVER_KEY 替換為你的 Server Key
```

## 📋 功能特色

### 🔐 用戶認證系統
- 用戶註冊和登入
- JWT 身份驗證
- 密碼加密儲存

### 🗺️ 互動地圖
- Google Maps 整合
- 點擊地圖添加咖啡廳
- 自定義標記和資訊視窗
- 地點搜尋功能

### 📍 咖啡廳管理
- CRUD 操作（新增、讀取、更新、刪除）
- 1-5 星評分系統
- 個人筆記功能
- 收藏功能

### 🔍 進階搜尋
- Google Places API 整合
- 附近咖啡廳搜尋
- 關鍵字搜尋

### 📱 響應式設計
- 支援桌面和移動設備
- Tailwind CSS 樣式
- 現代化 UI 設計

### 🛡️ 安全防護
- 輸入驗證
- CORS 配置
- SQL 注入防護
- 用戶資料隔離

### 📊 效能監控
- 實時效能監控儀表板
- API 快取機制
- 防抖動優化

## 🏗️ 技術架構

### 前端技術棧
- **React 18** + TypeScript
- **Vite** 建構工具
- **Tailwind CSS** 樣式框架
- **Google Maps JavaScript API**
- **Axios** HTTP 客戶端
- **React Router** 路由管理

### 後端技術棧
- **Node.js** + Express
- **TypeScript** 開發語言
- **SQLite** 資料庫
- **JWT** 身份驗證
- **bcrypt** 密碼加密
- **Zod** 輸入驗證

### 外部服務
- **Google Maps JavaScript API** - 地圖顯示
- **Google Places API** - 地點搜尋
- **Google Geocoding API** - 地址轉換

## 📊 API 端點

### 認證端點
- `POST /auth/register` - 用戶註冊
- `POST /auth/login` - 用戶登入

### 咖啡廳管理端點
- `GET /api/locations` - 取得用戶的咖啡廳列表
- `GET /api/locations/:id` - 取得特定咖啡廳
- `POST /api/locations` - 新增咖啡廳
- `PUT /api/locations/:id` - 更新咖啡廳
- `DELETE /api/locations/:id` - 刪除咖啡廳
- `PATCH /api/locations/:id/favorite` - 切換收藏狀態

### 搜尋端點
- `GET /api/search/places` - 使用 Google Places API 搜尋咖啡廳
- `GET /api/search/places/nearby` - 搜尋附近咖啡廳

### 系統端點
- `GET /health` - 服務器健康檢查
- `GET /api/performance` - 效能監控資料

## 🗄️ 資料庫結構

### Users 表
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Locations 表
```sql
CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  address TEXT,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## 🔧 環境變數配置

### 後端環境變數 (backend/.env)
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
GOOGLE_SERVER_KEY=your-google-server-api-key-here
DATABASE_PATH=./db.sqlite
NODE_ENV=development
```

### 前端環境變數 (cafe-explorer-frontend/.env)
```env
VITE_GOOGLE_MAPS_JS_KEY=your-google-maps-javascript-api-key-here
VITE_API_BASE_URL=http://localhost:3000
VITE_NODE_ENV=development
```

## 🛠️ 開發指令

### 後端指令
```bash
cd backend
npm run dev      # 開發模式
npm run build    # 建構專案
npm start        # 生產模式
```

### 前端指令
```bash
cd cafe-explorer-frontend
npm run dev      # 開發模式
npm run build    # 建構專案
npm run preview  # 預覽建構結果
npm run lint     # 程式碼檢查
```

### 專案根目錄指令
```bash
npm start        # 啟動完整應用
npm run backend  # 只啟動後端
npm run frontend # 只啟動前端
npm run stop     # 停止所有服務
npm run clean    # 清理端口
```

## 🐛 常見問題

### Q: 地圖無法載入
A: 檢查 `VITE_GOOGLE_MAPS_JS_KEY` 是否正確設定，並確認 API 金鑰有啟用 Maps JavaScript API

### Q: 搜尋功能無法使用
A: 檢查 `GOOGLE_SERVER_KEY` 是否正確設定，並確認 API 金鑰有啟用 Places API

### Q: 端口被占用
A: 執行 `npm run clean` 清理端口，或使用 `./port-manager.sh free-all`

### Q: 資料庫錯誤
A: 刪除 `backend/db.sqlite` 檔案，重新啟動後端服務

## 📚 相關文件

- [QUICK_START.md](QUICK_START.md) - 詳細啟動指南
- [SECURITY.md](SECURITY.md) - 安全配置說明
- [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) - 效能優化說明

## 🎯 評分重點

1. **功能完整性**: 用戶認證、CRUD 操作、地圖整合
2. **技術實作**: TypeScript、React、Express、SQLite
3. **API 整合**: Google Maps API 正確使用
4. **用戶體驗**: 響應式設計、錯誤處理
5. **程式碼品質**: 型別安全、錯誤處理、安全性
6. **效能優化**: 快取機制、防抖動、效能監控
