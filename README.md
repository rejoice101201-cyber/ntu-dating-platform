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

- **部署連結**: https://ntu-dating-platform-kappa.vercel.app
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
