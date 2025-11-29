# Facebook OAuth 設定指南

## 📋 概述

本指南將協助您設定 Facebook OAuth，讓用戶可以使用 Facebook 帳號登入您的應用程式。

## ✅ 前置條件

- 已有一個 Facebook 帳號
- 已部署的 Vercel 應用程式
- 已設定 Google OAuth（參考）

## 🚀 設定步驟

### 步驟 1: 前往 Facebook Developers

1. **訪問 Facebook Developers**
   - 網址：https://developers.facebook.com/
   - 使用您的 Facebook 帳號登入

2. **如果還沒有開發者帳號**
   - 點擊右上角 **Get Started** 或 **Log In**
   - 完成開發者帳號註冊（需要驗證身份）

### 步驟 2: 創建應用程式

1. **創建新應用**
   - 點擊右上角 **My Apps** 下拉選單
   - 選擇 **Create App**
   - 或直接訪問：https://developers.facebook.com/apps/create/

2. **選擇應用類型**
   - 選擇 **Consumer**（消費者應用）
   - 點擊 **Next**

3. **填寫應用資訊**
   - **App Display Name**: `Pikabu`（或您想要的應用名稱）
   - **App Contact Email**: 您的 email 地址
   - **Business Account**（可選）：如果有的話可以選擇
   - 點擊 **Create App**

4. **完成安全驗證**
   - 可能需要完成驗證碼驗證
   - 按照提示完成

### 步驟 3: 添加 Facebook Login 產品

1. **在應用 Dashboard**
   - 找到 **Add Products** 區塊
   - 或點擊左側選單的 **Products**

2. **添加 Facebook Login**
   - 找到 **Facebook Login**
   - 點擊 **Set Up** 按鈕

3. **選擇平台**
   - 選擇 **Web** 平台
   - 點擊 **Continue**

### 步驟 4: 設定 Facebook Login

1. **前往 Facebook Login 設定**
   - 在左側選單點擊 **Facebook Login** → **Settings**

2. **設定 Valid OAuth Redirect URIs**
   - 找到 **Valid OAuth Redirect URIs** 欄位
   - 添加以下兩個 URI：
     ```
     https://ntu-dating-platform-kappa.vercel.app/api/auth/callback/facebook
     http://localhost:3000/api/auth/callback/facebook
     ```
   - **注意**：請將 `ntu-dating-platform-kappa.vercel.app` 替換為您的實際 Vercel 網址
   - 點擊 **Save Changes**

3. **設定 Client OAuth Login**
   - 確認 **Client OAuth Login** 已啟用（應該預設為啟用）
   - 確認 **Web OAuth Login** 已啟用

### 步驟 5: 取得 App ID 和 App Secret

1. **前往基本設定**
   - 在左側選單點擊 **Settings** → **Basic**

2. **查看 App ID**
   - **App ID** 會顯示在頁面上
   - 複製這個值（這就是 `FACEBOOK_ID`）

3. **查看 App Secret**
   - 找到 **App Secret** 欄位
   - 點擊 **Show** 按鈕
   - 可能需要輸入 Facebook 密碼確認
   - 複製這個值（這就是 `FACEBOOK_SECRET`）

### 步驟 6: 設定應用網域（可選但建議）

1. **在 Settings → Basic**
   - 找到 **App Domains** 欄位
   - 添加您的網域：
     ```
     ntu-dating-platform-kappa.vercel.app
     ```
   - 點擊 **Save Changes**

2. **設定網站網址**
   - 找到 **Website** 區塊
   - 在 **Site URL** 中輸入：
     ```
     https://ntu-dating-platform-kappa.vercel.app
     ```
   - 點擊 **Save Changes**

### 步驟 7: 設定隱私政策網址（生產環境需要）

1. **在 Settings → Basic**
   - 找到 **Privacy Policy URL** 欄位
   - 輸入您的隱私政策網址（如果有的話）
   - 或暫時使用：
     ```
     https://ntu-dating-platform-kappa.vercel.app/privacy
     ```

2. **設定服務條款網址**
   - 找到 **Terms of Service URL** 欄位
   - 輸入您的服務條款網址（如果有的話）
   - 或暫時使用：
     ```
     https://ntu-dating-platform-kappa.vercel.app/terms
     ```

### 步驟 8: 在 Vercel 中設定環境變數

1. **前往 Vercel Dashboard**
   - 訪問：https://vercel.com/dashboard
   - 選擇您的專案

2. **前往環境變數設定**
   - 點擊 **Settings** 標籤
   - 點擊左側選單的 **Environment Variables**

3. **添加 FACEBOOK_ID**
   - 點擊 **Add New**
   - **Key**: `FACEBOOK_ID`
   - **Value**: 貼上您從 Facebook Developers 複製的 App ID
   - **Environment**: 選擇 **Production**, **Preview**, **Development**
   - 點擊 **Save**

4. **添加 FACEBOOK_SECRET**
   - 點擊 **Add New**
   - **Key**: `FACEBOOK_SECRET`
   - **Value**: 貼上您從 Facebook Developers 複製的 App Secret
   - **Environment**: 選擇 **Production**, **Preview**, **Development**
   - 點擊 **Save**

### 步驟 9: 重新部署

1. **觸發重新部署**
   - 方法 1：前往 **Deployments** 標籤
     - 點擊最新部署右側的 **...** 選單
     - 選擇 **Redeploy**
   - 方法 2：推送一個新的 commit 到 GitHub
     - Vercel 會自動觸發部署

2. **等待部署完成**
   - 部署通常需要 1-3 分鐘
   - 確認部署狀態為 **Ready**

### 步驟 10: 測試 Facebook 登入

1. **訪問網站**
   - 前往：https://ntu-dating-platform-kappa.vercel.app
   - 或您的 Vercel 網址

2. **測試登入**
   - 點擊 **使用 Facebook 登入** 按鈕
   - 應該會跳轉到 Facebook 授權頁面
   - 確認授權後應該會跳轉回您的應用
   - 確認可以成功登入

3. **檢查錯誤**
   - 如果出現錯誤，檢查：
     - Vercel 函數日誌
     - 瀏覽器控制台
     - Facebook Developers Console 中的錯誤日誌

## 🔍 驗證設定

### 檢查清單

- [ ] Facebook 應用程式已創建
- [ ] Facebook Login 產品已添加
- [ ] Valid OAuth Redirect URIs 已設定（包含生產和本地網址）
- [ ] App ID 和 App Secret 已取得
- [ ] Vercel 環境變數已設定（FACEBOOK_ID 和 FACEBOOK_SECRET）
- [ ] 應用已重新部署
- [ ] Facebook 登入功能正常運作

### 檢查環境變數

在 Vercel Dashboard → Settings → Environment Variables 中確認：

```
FACEBOOK_ID=您的 App ID（數字）
FACEBOOK_SECRET=您的 App Secret（長字串）
```

## 🚨 常見問題

### 問題 1: "Invalid OAuth Redirect URI"

**錯誤訊息**：
```
Invalid OAuth Redirect URI: The redirect_uri must match one of the registered OAuth redirect URIs.
```

**原因**：Redirect URI 沒有在 Facebook Developers 中註冊

**解決方法**：
1. 前往 Facebook Developers → Facebook Login → Settings
2. 確認 **Valid OAuth Redirect URIs** 中包含：
   - `https://您的網址.vercel.app/api/auth/callback/facebook`
   - `http://localhost:3000/api/auth/callback/facebook`
3. 點擊 **Save Changes**
4. 等待幾分鐘讓設定生效

### 問題 2: "App Not Setup"

**錯誤訊息**：
```
App Not Setup: This app is still in development mode.
```

**原因**：應用程式還在開發模式，只有開發者可以登入

**解決方法**（如果要在生產環境使用）：
1. 前往 Facebook Developers → Settings → Basic
2. 找到 **App Review** 區塊
3. 切換 **App Mode** 為 **Live**
4. **注意**：切換為 Live 模式需要：
   - 完成 App Review（提交審核）
   - 或添加測試用戶

**暫時解決方法**（開發階段）：
- 保持開發模式
- 只有您（應用管理員）和測試用戶可以登入
- 這在開發階段是正常的

### 問題 3: "Missing Client ID or Secret"

**錯誤訊息**：
```
Configuration error: Missing FACEBOOK_ID or FACEBOOK_SECRET
```

**原因**：環境變數沒有正確設定

**解決方法**：
1. 檢查 Vercel 環境變數
2. 確認 `FACEBOOK_ID` 和 `FACEBOOK_SECRET` 已設定
3. 確認環境變數已套用到正確的環境（Production, Preview, Development）
4. 重新部署應用

### 問題 4: Facebook 登入按鈕沒有顯示

**原因**：環境變數沒有設定，或設定錯誤

**解決方法**：
1. 檢查 `lib/auth.ts` 中的 Facebook provider 配置
2. 確認環境變數已正確設定
3. 檢查 Vercel 函數日誌是否有錯誤
4. 重新部署應用

### 問題 5: 登入後無法取得 email

**原因**：Facebook 需要額外權限才能取得 email

**解決方法**：
1. 前往 Facebook Developers → Facebook Login → Settings
2. 找到 **User Data Permissions**
3. 確認 **email** 權限已啟用
4. 在 NextAuth 配置中，Facebook provider 會自動請求 email 權限

## 📝 環境變數格式

在 Vercel 中設定的環境變數格式：

```env
FACEBOOK_ID=1234567890123456
FACEBOOK_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

**注意**：
- `FACEBOOK_ID` 是數字字串
- `FACEBOOK_SECRET` 是長字串（通常包含字母和數字）
- 不要包含引號或空格

## 🎯 下一步

設定完成後，您可以：

1. **測試 Facebook 登入**
   - 確認可以成功登入
   - 確認用戶資料正確儲存

2. **測試註冊流程**
   - 使用 Facebook 登入後
   - 完成註冊（設定 userID 和上傳照片）
   - 確認資料儲存在 MongoDB

3. **檢查資料庫**
   - 在 MongoDB Atlas 中查看 `users` 集合
   - 確認 email 格式為 `email#facebook`
   - 確認 `accounts` 集合中有 Facebook 帳號資訊

## 📚 相關文件

- `ENV_VARIABLES.md` - 所有環境變數說明
- `MONGODB_CHECK_GUIDE.md` - 如何檢查資料庫
- `WHAT_NEXT.md` - 其他可設定的功能

## 🔗 有用的連結

- Facebook Developers: https://developers.facebook.com/
- Facebook Login 文件: https://developers.facebook.com/docs/facebook-login
- NextAuth Facebook Provider: https://next-auth.js.org/providers/facebook

