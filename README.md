# ntu-dating-platform

約會網站專案 - Pikabu 風格的交友平台

## 📁 專案結構

### 生產環境
所有生產環境的代碼都在 `final-project/` 目錄中，這是當前 Vercel 部署的目錄。

```
ntu-dating-platform/
├── final-project/          # 生產環境（當前 Vercel 部署）
│   ├── app/                 # Next.js App Router
│   ├── components/          # React 組件
│   ├── lib/                 # 工具函數
│   ├── models/              # Mongoose Models
│   ├── package.json         # Next.js 專案配置
│   └── ...
├── frontend/                # 備份版本（保留，不使用）
│   └── ...                  # 之前成功部署的版本（使用 Prisma）
├── package.json             # 根目錄（monorepo 管理，可選）
├── README.md                # 本文件
├── .gitignore
└── LICENSE
```

### 目錄說明

#### `final-project/` - 生產環境
- ✅ **當前 Vercel 部署的目錄**
- ✅ 使用 Next.js 16 (App Router)
- ✅ 使用 MongoDB + Mongoose
- ✅ 使用 NextAuth v5
- ✅ 使用 Pusher 即時通訊

#### `frontend/` - 備份版本
- 📦 **保留作為備份**，不刪除
- 📦 之前成功部署的版本
- 📦 使用 Prisma（不同於 final-project）
- 📦 如果需要可以隨時恢復

## 🚀 快速開始

### 開發環境

請進入 `final-project/` 目錄：

```bash
cd final-project
npm install
npm run dev
```

詳細文檔請參考：[final-project/README.md](final-project/README.md)

## 🌐 線上版本

- **部署連結**: https://ntu-dating-platform1.vercel.app
- **GitHub**: https://github.com/rejoice101201-cyber/ntu-dating-platform

## ⚙️ Vercel 部署設定

### Root Directory
- **設定值**: `final-project`
- **設定位置**: Vercel Settings → Build and Deployment → Root Directory

### 環境變數
所有環境變數都在 Vercel Dashboard 中設定，包括：
- MongoDB 連接字串
- NextAuth 配置
- OAuth 憑證
- Pusher 配置

詳細說明請參考：[final-project/ENV_VARIABLES.md](final-project/ENV_VARIABLES.md)

## 🛠️ 技術棧

- **框架**: Next.js 16 (App Router)
- **語言**: TypeScript
- **認證**: NextAuth.js v5 (Google OAuth)
- **資料庫**: MongoDB + Mongoose ORM
- **即時通訊**: Pusher
- **樣式**: Tailwind CSS
- **部署**: Vercel

## ✨ 主要功能

- **多重登入**：Google OAuth、UserID（可免密碼）、Email/Password；忘記密碼寄送重設連結。(R14631031)
- **像素風 UI**：Press Start 2P 字體、淺色像素格背景、深色高對比按鈕。(R14631031)
- **探索/配對**：推薦清單、1~5 分評分（消耗體力）、標籤顯示與匹配度。(R12944069)
- **聊天室**：Pusher 即時訊息、時間戳、AI 開場白建議、Q&A 遊戲（發起/回答/猜測），完成或正確可獲得鑰匙。(R12944069)
- **解鎖照片**：照片有模糊度，透過鑰匙解鎖；支援 Vercel Blob 上傳/刪除個人照片。(R12944069)
- **個人檔案**：可編輯基本資料（身高、體重、職業、學校、血型、位置、Bio），設定配對偏好（性別、年齡區間），查看他人檔案與解鎖進度。(R12944069)
- **AI/QA/Game API**：AI coach（opening lines / topics / profile 建議）、QA 題庫、猜題/答題遊戲、照片模糊與解鎖邏輯。(R12944069)

## 📝 重要提醒

### 關於檔案結構
- ✅ `final-project/` 是生產環境，Vercel 部署此目錄
- ✅ `frontend/` 是備份版本，保留但不使用
- ✅ 兩個目錄可以並存，互不影響

### 關於 Vercel 設定
- ⚠️ **Root Directory 必須設定為 `final-project`**
- ⚠️ 這樣 Vercel 會從 `final-project/` 目錄開始建置
- ⚠️ `frontend/` 目錄不會被使用

## 📚 專案文檔

所有專案相關的文檔都在 `final-project/` 目錄中：

- `final-project/README.md` - 專案說明和快速開始
- `final-project/PROJECT_STATUS.md` - 專案狀態與架構
- `final-project/ENV_VARIABLES.md` - 環境變數說明
- `final-project/PRODUCTION_DEPLOYMENT_GUIDE.md` - 生產環境部署指南
- 更多文檔請查看 `final-project/` 目錄
