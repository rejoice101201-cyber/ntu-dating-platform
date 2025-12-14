# 專案協作狀態報告

## 📋 專案概述

這是一個類似 Pikabu 的約會網站全端專案，使用 **Next.js 16 (App Router)** + **MongoDB** + **NextAuth.js** + **Pusher** 構建。

**部署狀態**：✅ 已成功部署到 Vercel  
**部署連結**：https://ntu-dating-platform-kappa.vercel.app  
**GitHub 倉庫**：https://github.com/rejoice101201-cyber/ntu-dating-platform

---

## ✅ 已完成功能

### 1. 認證系統 (NextAuth.js)
- ✅ Google OAuth 登入
- ✅ 用戶註冊流程（設定 userID、上傳照片）
- ✅ Session 管理
- ✅ 認證路由保護

### 2. 資料庫 (MongoDB + Mongoose)
- ✅ User 模型（userID、照片、標籤、個人資料）
- ✅ Chat 模型（聊天室）
- ✅ Message 模型（訊息）
- ✅ Match 模型（配對記錄）

### 3. API 端點
- ✅ `/api/auth/[...nextauth]` - NextAuth 處理器
- ✅ `/api/register` - 用戶註冊
- ✅ `/api/profile` - 個人資料 CRUD
- ✅ `/api/profile/upload` - 照片上傳（Vercel Blob Storage）
- ✅ `/api/match/recommendations` - 推薦清單
- ✅ `/api/match/like` - 喜歡功能
- ✅ `/api/match/pass` - 跳過功能
- ✅ `/api/match/matches` - 已配對列表
- ✅ `/api/chat` - 聊天室列表
- ✅ `/api/chat/[chatId]` - 聊天室詳情
- ✅ `/api/chat/[chatId]/messages` - 發送訊息
- ✅ `/api/pusher/auth` - Pusher 認證

### 4. 前端頁面
- ✅ `/auth/signin` - 登入頁面（Google OAuth）
- ✅ `/auth/register` - 註冊頁面（設定 userID、上傳照片）
- ✅ `/` - 配對首頁（推薦清單）
- ✅ `/chat` - 聊天室列表
- ✅ `/chat/[chatId]` - 聊天室內頁
- ✅ `/profile` - 個人資料頁面

### 5. 即時通訊 (Pusher)
- ✅ Pusher 服務端配置
- ✅ Pusher 客戶端配置
- ✅ 即時訊息推送

---

## ⚠️ 目前狀態與問題

### 已解決的問題
1. ✅ **路由衝突**：已刪除 `app/page.tsx`，統一使用 `app/(main)/page.tsx`
2. ✅ **認證系統混亂**：已清理舊的 `/auth/login` 路由，統一使用 NextAuth `/auth/signin`
3. ✅ **構建錯誤**：已修復 MongoDB 依賴衝突、Turbopack 配置、PostCSS 配置等
4. ✅ **部署成功**：Vercel 部署已成功，網站可正常訪問

### 當前已知問題
1. ⚠️ **控制台警告**：`signin:1 Failed to load resource: 404` - 這是 source map 載入失敗，不影響功能
2. ⚠️ **Facebook OAuth**：尚未配置（目前只使用 Google OAuth）
3. ⚠️ **配對算法**：目前是基本實現，可能需要優化

---

## 🚀 如何開始協作

### 1. 克隆專案
```bash
git clone git@github.com:rejoice101201-cyber/ntu-dating-platform.git
cd ntu-dating-platform/final-project
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 設置環境變數
在 `final-project/` 目錄下創建 `.env.local` 文件：

```env
# MongoDB
MONGODB_URI=mongodb+srv://rejoice101201_db_user:S0dfnuRMuJznVWEi@datingapp.1u9qrx5.mongodb.net/?appName=DatingApp

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=U7FS/yDMj1kBpwO5O7htFb3CjB+240sOpMoBCTXKjQA=

# Google OAuth
GOOGLE_CLIENT_ID=509318580080-2kko35m08jd0icaa4143mrcl7cgl9o5a.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Pusher
NEXT_PUBLIC_PUSHER_APP_KEY=05455f7af1f4dc259724
PUSHER_APP_ID=2084187
PUSHER_SECRET=e3751b141af7f68c7fa2
NEXT_PUBLIC_PUSHER_CLUSTER=ap3

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_8sRz3T9Y3XSRnANr_mKu9bjHMigbTQUgpwL3bAFVn4XeAbC
SHARP_IGNORE_GLOBAL_LIBVIPS=1
```

### 4. 運行開發服務器
```bash
npm run dev
```

訪問 http://localhost:3000

---

## 📝 需要協助的部分

### 優先級 1：功能完善
1. **配對算法優化**
   - 當前位置：`app/api/match/recommendations/route.ts`
   - 需要：根據興趣、個性標籤實現更智能的匹配算法
   - 可能需要：添加年齡、地理位置等篩選條件

2. **UI/UX 優化**
   - 當前位置：`app/(main)/page.tsx`, `components/match/MatchCard.tsx`
   - 需要：美化配對卡片、添加動畫效果、優化移動端體驗

3. **聊天功能完善
   - 當前位置：`app/(main)/chat/[chatId]/page.tsx`
   - 需要：添加圖片發送、表情符號、訊息已讀狀態等

### 優先級 2：功能擴展
1. **Facebook OAuth 配置**
   - 當前位置：`lib/auth.ts`
   - 需要：添加 Facebook OAuth provider

2. **個人資料編輯**
   - 當前位置：`app/(main)/profile/page.tsx`
   - 需要：完善標籤編輯、照片管理等功能

3. **自動刪除聊天室邏輯**
   - 當前位置：`app/api/chat/cleanup/route.ts`
   - 需要：實現定期清理超過 7 天無對話且非朋友的聊天室

### 優先級 3：測試與優化
1. **錯誤處理**
   - 需要：添加更完善的錯誤提示和處理機制

2. **性能優化**
   - 需要：圖片懶加載、API 響應緩存等

3. **測試**
   - 需要：編寫單元測試和整合測試

---

## 🗂️ 專案結構

```
final-project/
├── app/
│   ├── (auth)/              # 認證相關頁面
│   │   ├── signin/          # 登入頁面
│   │   ├── register/        # 註冊頁面
│   │   └── error/           # 錯誤頁面
│   ├── (main)/              # 主要應用頁面
│   │   ├── page.tsx         # 配對首頁
│   │   ├── chat/            # 聊天相關
│   │   └── profile/         # 個人資料
│   └── api/                 # API 路由
│       ├── auth/            # NextAuth
│       ├── register/        # 註冊
│       ├── profile/         # 個人資料
│       ├── match/           # 配對
│       ├── chat/            # 聊天
│       └── pusher/          # Pusher 認證
├── components/              # React 組件
│   └── match/              # 配對相關組件
├── lib/                     # 工具函數
│   ├── auth.ts             # NextAuth 配置
│   ├── db.ts               # MongoDB 連接
│   ├── pusher.ts           # Pusher 服務端
│   └── pusher-client.ts    # Pusher 客戶端
├── models/                  # Mongoose Models
│   ├── User.ts
│   ├── Chat.ts
│   ├── Message.ts
│   └── Match.ts
└── types/                   # TypeScript 類型定義
```

---

## 🔧 技術棧

- **框架**：Next.js 16 (App Router)
- **語言**：TypeScript
- **認證**：NextAuth.js v5
- **資料庫**：MongoDB + Mongoose
- **即時通訊**：Pusher
- **樣式**：Tailwind CSS
- **部署**：Vercel
- **檔案儲存**：Vercel Blob Storage

---

## 📞 聯絡方式

如有任何問題，請：
1. 查看 GitHub Issues
2. 在團隊群組中討論
3. 查看 Vercel 部署日誌：https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform

---

## 📌 重要提醒

1. **不要直接修改生產環境**：所有更改都應該先在本地測試，然後推送到 GitHub，讓 Vercel 自動部署
2. **環境變數**：不要將 `.env.local` 提交到 Git（已在 `.gitignore` 中）
3. **分支管理**：建議為新功能創建分支，完成後再合併到 `main`
4. **測試**：在推送前請確保本地測試通過

---

**最後更新**：2024-11-30  
**維護者**：朋員

