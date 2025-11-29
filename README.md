# ntu-dating-platform

約會網站專案 - Pikabu 風格的交友平台

## 📁 專案結構

所有專案代碼都在 `final-project/` 目錄中。

```
ntu-dating-platform/
└── final-project/          # 主要專案目錄
    ├── app/                 # Next.js App Router
    ├── components/          # React 組件
    ├── lib/                 # 工具函數
    ├── models/              # Mongoose Models
    └── ...
```

## 🚀 快速開始

請進入 `final-project/` 目錄查看詳細說明：

```bash
cd final-project
```

詳細文檔請參考：[final-project/README.md](final-project/README.md)

## 🌐 線上版本

- **部署連結**: https://ntu-dating-platform-kappa.vercel.app
- **GitHub**: https://github.com/rejoice101201-cyber/ntu-dating-platform

## 📚 專案文檔

所有專案相關的文檔都在 `final-project/` 目錄中：

- `final-project/README.md` - 專案說明和快速開始
- `final-project/PROJECT_STATUS.md` - 專案狀態與架構
- `final-project/ENV_VARIABLES.md` - 環境變數說明
- `final-project/PUSHER_SETUP.md` - Pusher 設定指南
- `final-project/FACEBOOK_OAUTH_SETUP.md` - Facebook OAuth 設定
- 更多文檔請查看 `final-project/` 目錄

## 🛠️ 技術棧

- **框架**: Next.js 16 (App Router)
- **語言**: TypeScript
- **認證**: NextAuth.js v5 (Google OAuth)
- **資料庫**: MongoDB + Mongoose ORM
- **即時通訊**: Pusher
- **樣式**: Tailwind CSS
- **部署**: Vercel

## 📝 注意事項

- 所有專案代碼都在 `final-project/` 目錄中
- 請在 `final-project/` 目錄中執行所有命令
- Vercel 部署時需要設定 Root Directory 為 `final-project`
