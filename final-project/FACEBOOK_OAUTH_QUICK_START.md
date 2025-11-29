# Facebook OAuth 快速設定指南

## 🚀 5 分鐘快速設定

### 步驟 1: 創建 Facebook 應用（2 分鐘）

1. 訪問：https://developers.facebook.com/apps/create/
2. 選擇 **Consumer** → **Next**
3. 填寫：
   - App Display Name: `Pikabu`
   - App Contact Email: 您的 email
4. 點擊 **Create App**

### 步驟 2: 添加 Facebook Login（1 分鐘）

1. 在 Dashboard 找到 **Add Products**
2. 找到 **Facebook Login** → **Set Up**
3. 選擇 **Web** 平台

### 步驟 3: 設定 Redirect URI（1 分鐘）

1. 左側選單：**Facebook Login** → **Settings**
2. 在 **Valid OAuth Redirect URIs** 添加：
   ```
   https://ntu-dating-platform-kappa.vercel.app/api/auth/callback/facebook
   http://localhost:3000/api/auth/callback/facebook
   ```
3. 點擊 **Save Changes**

### 步驟 4: 取得憑證（30 秒）

1. 左側選單：**Settings** → **Basic**
2. 複製 **App ID**（這就是 `FACEBOOK_ID`）
3. 點擊 **Show** 顯示 **App Secret**（這就是 `FACEBOOK_SECRET`）
4. 複製 **App Secret**

### 步驟 5: 設定 Vercel 環境變數（30 秒）

1. Vercel Dashboard → Settings → Environment Variables
2. 添加：
   - **Key**: `FACEBOOK_ID`，**Value**: 您的 App ID
   - **Key**: `FACEBOOK_SECRET`，**Value**: 您的 App Secret
3. Environment: 選擇 **Production**, **Preview**, **Development**
4. 點擊 **Save**

### 步驟 6: 重新部署（1 分鐘）

1. Vercel Dashboard → Deployments
2. 點擊最新部署的 **...** → **Redeploy**
3. 等待部署完成

### 步驟 7: 測試（30 秒）

1. 訪問您的網站
2. 點擊 **使用 Facebook 登入**
3. 確認可以成功登入 ✅

## ⚠️ 重要提醒

### Redirect URI 格式

確保在 Facebook Developers 中設定的 Redirect URI 完全匹配：

```
https://您的網址.vercel.app/api/auth/callback/facebook
http://localhost:3000/api/auth/callback/facebook
```

**注意**：
- 必須包含完整的路徑 `/api/auth/callback/facebook`
- 生產環境使用 `https://`
- 本地開發使用 `http://localhost:3000`

### 環境變數格式

在 Vercel 中設定時，不要包含引號：

```
✅ 正確：FACEBOOK_ID=1234567890123456
❌ 錯誤：FACEBOOK_ID="1234567890123456"
```

### 開發模式限制

如果應用還在開發模式：
- 只有應用管理員和測試用戶可以登入
- 要讓所有人使用，需要切換為 Live 模式（需要 App Review）

## 🚨 常見錯誤

### "Invalid OAuth Redirect URI"

**解決**：檢查 Facebook Developers 中的 Redirect URI 是否正確設定

### "App Not Setup"

**解決**：應用還在開發模式，這是正常的。只有管理員可以登入。

### 登入按鈕沒有顯示

**解決**：檢查 Vercel 環境變數是否正確設定，並重新部署

## 📋 檢查清單

完成設定後，確認：

- [ ] Facebook 應用已創建
- [ ] Facebook Login 產品已添加
- [ ] Redirect URI 已設定（生產和本地）
- [ ] App ID 和 App Secret 已取得
- [ ] Vercel 環境變數已設定
- [ ] 應用已重新部署
- [ ] Facebook 登入功能正常

## 📚 詳細說明

如果需要更詳細的說明，請參考：`FACEBOOK_OAUTH_SETUP.md`

