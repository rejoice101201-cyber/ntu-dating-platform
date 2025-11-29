# 協作者設定指南

## 邀請協作者到 Vercel 專案

### 步驟 1: 在 Vercel 中邀請協作者

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的專案
3. 前往 **Settings** → **Team** 或 **Members**
4. 點擊 **Invite Member** 或 **Add Member**
5. 輸入協作者的：
   - **Email 地址**（必須是 Vercel 帳號的 email）
   - **權限級別**：
     - **Owner**: 完全控制權
     - **Member**: 可以部署和查看
     - **Developer**: 只能查看和部署（推薦）
6. 點擊 **Send Invitation**
7. 協作者會收到邀請 email，點擊連結接受邀請

### 步驟 2: 協作者接受邀請

協作者需要：
1. 檢查 email 收件匣（包含 Vercel 邀請）
2. 點擊邀請連結
3. 如果沒有 Vercel 帳號，需要先註冊
4. 接受邀請後即可訪問專案

### 步驟 3: 協作者訪問專案

協作者可以：
- 查看部署歷史
- 查看部署日誌
- 訪問部署的網站（如果有部署）
- 查看專案設定（根據權限）

## 暫時不設定環境變數的部署

為了讓協作者可以先看到專案運行，我們可以：

### 選項 A: 使用預設值部署（僅供查看）

專案已經配置為在沒有環境變數時也能構建，但功能會受限：

1. 在 Vercel 中點擊 **Deploy**
2. 構建會使用預設值（dummy values）
3. 部署會成功，但功能無法正常使用
4. 協作者可以看到 UI 和頁面結構

### 選項 B: 設定最小環境變數（推薦）

為了讓專案至少可以構建和顯示，設定以下最小環境變數：

```env
# 最小環境變數（用於構建和顯示）
MONGODB_URI=mongodb://localhost:27017/test
NEXTAUTH_URL=https://your-project.vercel.app
AUTH_SECRET=temp-secret-for-build-only
GOOGLE_CLIENT_ID=temp
GOOGLE_CLIENT_SECRET=temp
FACEBOOK_ID=temp
FACEBOOK_SECRET=temp
NEXT_PUBLIC_PUSHER_APP_KEY=temp
PUSHER_APP_ID=temp
PUSHER_SECRET=temp
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

**注意**：這些是臨時值，僅用於構建。實際功能需要真實的環境變數。

## 協作者權限說明

### Developer（開發者）
- ✅ 查看專案
- ✅ 查看部署
- ✅ 查看日誌
- ✅ 觸發部署
- ❌ 修改環境變數
- ❌ 修改專案設定
- ❌ 刪除專案

### Member（成員）
- ✅ 所有 Developer 權限
- ✅ 修改環境變數
- ✅ 修改專案設定
- ❌ 刪除專案
- ❌ 管理團隊成員

### Owner（擁有者）
- ✅ 完全控制權
- ✅ 所有 Member 權限
- ✅ 刪除專案
- ✅ 管理團隊成員

## 協作者本地開發設定

協作者在本地開發時需要：

### 1. 克隆 Repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo/final-project
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 創建 `.env.local`（可選，用於本地測試）

```env
# 本地開發環境變數（可選）
MONGODB_URI=mongodb://localhost:27017/pikabu
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=local-dev-secret
# ... 其他環境變數
```

### 4. 運行開發伺服器

```bash
npm run dev
```

## 查看部署的網站

即使沒有設定真實環境變數，協作者仍然可以：

1. 訪問 Vercel 專案頁面
2. 點擊 **Deployments** 標籤
3. 點擊最新的部署
4. 點擊 **Visit** 或訪問提供的 URL

**注意**：網站會顯示，但功能（登入、資料庫操作等）無法正常使用。

## 常見問題

### Q: 協作者看不到專案？

**A**: 
1. 確認已發送邀請
2. 確認協作者已接受邀請
3. 確認協作者使用正確的 Vercel 帳號（與邀請 email 相同）

### Q: 構建失敗怎麼辦？

**A**: 
1. 檢查構建日誌
2. 確認所有必要的環境變數都已設定（即使是臨時值）
3. 檢查 GitHub repository 是否正確連接

### Q: 協作者可以修改代碼嗎？

**A**: 
- 代碼修改需要 GitHub 權限
- Vercel 權限只影響部署和專案設定
- 如果協作者有 GitHub repository 的寫入權限，可以：
  1. 推送代碼到 GitHub
  2. Vercel 會自動觸發新的部署

## 下一步

當準備好設定真實環境變數時：

1. 參考 `VERCEL_DEPLOYMENT.md` 獲取所需資訊
2. 在 Vercel Dashboard → Settings → Environment Variables 中設定
3. 重新部署專案

## 快速檢查清單

- [ ] 已邀請協作者到 Vercel 專案
- [ ] 協作者已接受邀請
- [ ] 協作者可以訪問 Vercel Dashboard
- [ ] 專案已成功部署（即使使用臨時環境變數）
- [ ] 協作者可以訪問部署的網站
- [ ] 協作者有 GitHub repository 的訪問權限（如果需要修改代碼）


