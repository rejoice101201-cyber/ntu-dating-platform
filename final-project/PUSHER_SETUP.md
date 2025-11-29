# Pusher 即時聊天設定指南

## 📋 概述

Pusher 用於實現即時聊天功能。設定完成後，配對成功的用戶可以即時互相發送訊息。

## ✅ 前置條件

- 已部署的 Vercel 應用程式
- 已設定 MongoDB
- 已設定 Google OAuth（至少一個登入方式）

## 🚀 設定步驟

### 步驟 1: 前往 Pusher

1. **訪問 Pusher 官網**
   - 網址：https://pusher.com/
   - 點擊右上角 **Sign Up** 或 **Log In**

2. **註冊/登入帳號**
   - 如果還沒有帳號，完成註冊
   - 使用 email 或 GitHub 帳號註冊

### 步驟 2: 創建 Channels App

1. **進入 Dashboard**
   - 登入後會自動進入 Dashboard
   - 或點擊 **Channels apps** 標籤

2. **創建新應用**
   - 點擊 **Create app** 按鈕
   - 或訪問：https://dashboard.pusher.com/apps/new

3. **填寫應用資訊**
   - **App name**: `Pikabu Chat`（或您想要的名稱）
   - **Cluster**: 選擇離您最近的區域
     - 台灣/亞洲：選擇 `ap1`（Tokyo）或 `ap3`（Singapore）
     - 其他區域：選擇對應的 cluster
   - **Front-end tech**: 選擇 **React**
   - **Back-end tech**: 選擇 **Node.js**
   - 點擊 **Create app**

### 步驟 3: 取得憑證

1. **進入應用 Dashboard**
   - 創建完成後會自動進入應用 Dashboard
   - 或從 **Channels apps** 列表中點擊您的應用

2. **查看 App Keys**
   - 點擊 **App Keys** 標籤
   - 應該可以看到以下資訊：
     - **App ID**（數字）
     - **Key**（長字串，這就是 `NEXT_PUBLIC_PUSHER_APP_KEY`）
     - **Secret**（長字串，這就是 `PUSHER_SECRET`）
     - **Cluster**（例如：`ap1`，這就是 `NEXT_PUBLIC_PUSHER_CLUSTER`）

3. **複製憑證**
   - 複製 **App ID**
   - 複製 **Key**
   - 複製 **Secret**（點擊 **Reveal** 顯示）
   - 記下 **Cluster** 名稱

### 步驟 4: 在 Vercel 中設定環境變數

1. **前往 Vercel Dashboard**
   - 訪問：https://vercel.com/dashboard
   - 選擇您的專案

2. **前往環境變數設定**
   - 點擊 **Settings** 標籤
   - 點擊左側選單的 **Environment Variables**

3. **添加環境變數**

   添加以下 4 個環境變數：

   **a. NEXT_PUBLIC_PUSHER_APP_KEY**
   - **Key**: `NEXT_PUBLIC_PUSHER_APP_KEY`
   - **Value**: 貼上您從 Pusher 複製的 **Key**
   - **Environment**: 選擇 **Production**, **Preview**, **Development**
   - 點擊 **Save**

   **b. PUSHER_APP_ID**
   - **Key**: `PUSHER_APP_ID`
   - **Value**: 貼上您從 Pusher 複製的 **App ID**
   - **Environment**: 選擇 **Production**, **Preview**, **Development**
   - 點擊 **Save**

   **c. PUSHER_SECRET**
   - **Key**: `PUSHER_SECRET`
   - **Value**: 貼上您從 Pusher 複製的 **Secret**
   - **Environment**: 選擇 **Production**, **Preview**, **Development**
   - 點擊 **Save**

   **d. NEXT_PUBLIC_PUSHER_CLUSTER**
   - **Key**: `NEXT_PUBLIC_PUSHER_APP_KEY`
   - **Value**: 貼上您從 Pusher 記下的 **Cluster**（例如：`ap1`）
   - **Environment**: 選擇 **Production**, **Preview**, **Development**
   - 點擊 **Save**

### 步驟 5: 重新部署

1. **觸發重新部署**
   - 方法 1：前往 **Deployments** 標籤
     - 點擊最新部署右側的 **...** 選單
     - 選擇 **Redeploy**
   - 方法 2：推送一個新的 commit 到 GitHub
     - Vercel 會自動觸發部署

2. **等待部署完成**
   - 部署通常需要 1-3 分鐘
   - 確認部署狀態為 **Ready**

### 步驟 6: 測試即時聊天

1. **創建測試用戶**
   - 使用不同的 Google 帳號登入
   - 創建至少 2 個測試用戶
   - 每個用戶完成註冊（userID + 照片）

2. **測試配對**
   - 使用用戶 A 登入
   - 對用戶 B 點擊 **Like**
   - 使用用戶 B 登入
   - 對用戶 A 點擊 **Like**
   - 確認雙向匹配成功

3. **測試即時聊天**
   - 配對成功後，應該可以看到聊天室
   - 點擊進入聊天室
   - 發送訊息
   - 在另一個瀏覽器/無痕視窗中使用另一個用戶登入
   - 確認可以即時看到訊息

## 🔍 驗證設定

### 檢查清單

- [ ] Pusher 應用已創建
- [ ] 已取得所有憑證（App ID, Key, Secret, Cluster）
- [ ] Vercel 環境變數已設定（4 個變數）
- [ ] 應用已重新部署
- [ ] 可以成功配對用戶
- [ ] 即時聊天功能正常運作

### 檢查環境變數

在 Vercel Dashboard → Settings → Environment Variables 中確認：

```
NEXT_PUBLIC_PUSHER_APP_KEY=您的 Key
PUSHER_APP_ID=您的 App ID
PUSHER_SECRET=您的 Secret
NEXT_PUBLIC_PUSHER_CLUSTER=您的 Cluster（例如：ap1）
```

## 🚨 常見問題

### 問題 1: "Pusher connection failed"

**錯誤訊息**：
```
Pusher connection failed
```

**原因**：環境變數沒有正確設定或部署

**解決方法**：
1. 檢查 Vercel 環境變數是否正確設定
2. 確認所有 4 個環境變數都已設定
3. 確認環境變數已套用到正確的環境（Production, Preview, Development）
4. 重新部署應用

### 問題 2: "Invalid cluster"

**錯誤訊息**：
```
Invalid cluster
```

**原因**：Cluster 名稱不正確

**解決方法**：
1. 檢查 `NEXT_PUBLIC_PUSHER_CLUSTER` 是否正確
2. 確認 Cluster 名稱與 Pusher Dashboard 中顯示的一致
3. 常見的 Cluster 名稱：`ap1`, `ap3`, `eu`, `us2` 等

### 問題 3: 訊息無法即時顯示

**原因**：
1. Pusher 連接失敗
2. 頻道訂閱失敗
3. 事件沒有正確觸發

**解決方法**：
1. 檢查瀏覽器控制台（F12 → Console）
2. 檢查 Vercel 函數日誌
3. 確認 Pusher 憑證正確
4. 確認頻道名稱正確

### 問題 4: 認證失敗

**錯誤訊息**：
```
Pusher authentication failed
```

**原因**：Pusher 認證端點有問題

**解決方法**：
1. 檢查 `/api/pusher/auth` 路由是否正常
2. 檢查 Vercel 函數日誌
3. 確認 `PUSHER_SECRET` 正確

## 📝 環境變數格式

在 Vercel 中設定的環境變數格式：

```env
NEXT_PUBLIC_PUSHER_APP_KEY=abcdefghijklmnop
PUSHER_APP_ID=1234567
PUSHER_SECRET=abcdefghijklmnopqrstuvwxyz123456
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

**注意**：
- `NEXT_PUBLIC_` 前綴的變數會暴露給客戶端
- 不要包含引號或空格
- Cluster 名稱通常是 2-3 個字元（如 `ap1`, `ap3`, `eu`）

## 🎯 下一步

設定完成後，您可以：

1. **測試即時聊天**
   - 創建多個測試用戶
   - 測試配對和聊天功能
   - 確認訊息可以即時顯示

2. **測試多用戶場景**
   - 同時多個用戶在線
   - 測試訊息同步
   - 確認沒有延遲

3. **優化聊天體驗**
   - 添加訊息已讀狀態
   - 添加打字指示器
   - 優化 UI/UX

## 📚 相關文件

- `ENV_VARIABLES.md` - 所有環境變數說明
- `PROJECT_STATUS.md` - 專案狀態與架構
- `WHAT_NEXT.md` - 其他可設定的功能

## 🔗 有用的連結

- Pusher Dashboard: https://dashboard.pusher.com/
- Pusher 文件: https://pusher.com/docs/
- Next.js + Pusher 範例: https://pusher.com/tutorials/chat-nextjs

