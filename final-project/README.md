# Pikabu 約會網站 - Final Project

## 🚀 部署連結

**生產環境：** https://ntu-dating-platform-kappa.vercel.app

點擊上方連結即可訪問網站進行評分。

## 📋 專案簡介

這是一個類似 Pikabu 的約會網站全端專案，使用 Next.js 16 (App Router) + MongoDB + NextAuth.js + Pusher 構建。

## ✨ 主要功能

### 1. 認證系統
- Google OAuth 登入
- 用戶註冊流程（設定 userID、上傳照片）
- Session 管理

### 2. 配對系統
- 推薦清單（根據興趣、個性標籤匹配）
- 喜歡/跳過功能
- 配對成功後可開始聊天

### 3. 聊天系統
- 即時訊息（使用 Pusher）
- 聊天室列表
- 訊息歷史記錄

### 4. 個人資料
- 照片上傳（Vercel Blob Storage）
- 個人資料編輯
- 標籤系統（個性、興趣、外貌）

## 🛠️ 技術棧

- **框架：** Next.js 16 (App Router)
- **語言：** TypeScript
- **認證：** NextAuth.js v5
- **資料庫：** MongoDB + Mongoose
- **即時通訊：** Pusher
- **樣式：** Tailwind CSS
- **部署：** Vercel

## 📁 專案結構

```
final-project/
├── app/                 # Next.js App Router
│   ├── (auth)/         # 認證相關頁面
│   ├── (main)/         # 主要應用頁面
│   └── api/            # API 路由
├── components/         # React 組件
├── lib/                # 工具函數
├── models/             # Mongoose Models
└── types/              # TypeScript 類型定義
```

## 🎯 評分說明

請使用上方部署連結訪問網站，測試以下功能：

1. **登入功能**
   - 點擊「使用 Google 登入」
   - 完成 OAuth 授權

2. **註冊流程**
   - 設定 userID（1-15 字元，字母數字底線）
   - 上傳照片

3. **配對功能**
   - 查看推薦清單
   - 測試喜歡/跳過功能

4. **聊天功能**
   - 配對成功後進入聊天室
   - 發送即時訊息

5. **個人資料**
   - 查看和編輯個人資料
   - 管理照片

## 📞 聯絡資訊

如有任何問題，請聯繫專案維護者。

---

**最後更新：** 2024-11-30  
**部署狀態：** ✅ 生產環境運行中
