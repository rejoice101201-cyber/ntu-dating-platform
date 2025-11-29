# Vercel 部署問題診斷與修復

## 🔍 問題診斷

### 已確認的狀態
- ✅ Git 推送成功：commit `bae8a75` 已在 GitHub
- ✅ Remote 設定正確：`ntu-dating` → `rejoice101201-cyber/ntu-dating-platform`
- ✅ Branch 正確：推送到了 `main` branch
- ❌ Vercel 沒有觸發自動部署

### 可能的原因
1. **Root Directory 設定錯誤**（最常見）
2. **Git 連接斷開或失效**
3. **GitHub Webhook 未設定或失效**
4. **Production Branch 設定錯誤**

## 🛠️ 解決方案

### 方法 1: 檢查並修正 Root Directory（最重要）

#### 步驟 1.1: 檢查當前設定
1. 前往：https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/settings/general
2. 找到 **Root Directory** 設定
3. 確認是否設定為：`final-project`

#### 步驟 1.2: 修正 Root Directory
如果 Root Directory 不是 `final-project` 或為空：

1. 點擊 **Edit** 按鈕
2. 在 **Root Directory** 欄位輸入：`final-project`
3. 點擊 **Save**
4. Vercel 會自動觸發新的部署

### 方法 2: 重新連接 Git Repository

#### 步驟 2.1: 檢查 Git 連接
1. 前往：https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/settings/git
2. 檢查是否顯示：
   - **Repository**: `rejoice101201-cyber/ntu-dating-platform`
   - **Production Branch**: `main`
   - **Root Directory**: `final-project`

#### 步驟 2.2: 重新連接（如果需要）
如果顯示 "Connect Git" 或連接異常：

1. 點擊 **Disconnect**（如果已連接）
2. 點擊 **Connect Git Repository**
3. 選擇 **GitHub**
4. 選擇 Repository：`rejoice101201-cyber/ntu-dating-platform`
5. **重要**：在 **Root Directory** 欄位輸入：`final-project`
6. 點擊 **Save**
7. Vercel 會自動觸發首次部署

### 方法 3: 檢查 GitHub Webhook

#### 步驟 3.1: 檢查 Webhook 設定
1. 前往 GitHub：https://github.com/rejoice101201-cyber/ntu-dating-platform/settings/hooks
2. 應該看到 Vercel 的 webhook
3. 確認狀態為 **Active**

#### 步驟 3.2: 重新設定 Webhook（如果需要）
如果沒有 webhook 或狀態為 Inactive：

1. 在 Vercel 中重新連接 Git（方法 2）
2. Vercel 會自動設定 webhook
3. 或手動在 GitHub 中設定 webhook

### 方法 4: 手動觸發部署

如果上述方法都無法解決，可以手動觸發部署：

#### 步驟 4.1: 在 Vercel Dashboard 手動部署
1. 前往：https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/deployments
2. 點擊 **Create Deployment**
3. 選擇：
   - **Branch**: `main`
   - **Root Directory**: `final-project`
4. 點擊 **Deploy**

#### 步驟 4.2: 使用 Vercel CLI（可選）
```bash
cd "/home/denny/下載/網路服務程式設計/wp1141/final-project"
npx vercel --prod
```

## 📋 完整檢查清單

### Vercel Settings → General
- [ ] **Root Directory**: `final-project` ⚠️ **最重要**
- [ ] **Framework Preset**: Next.js
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: `.next`

### Vercel Settings → Git
- [ ] **Repository**: `rejoice101201-cyber/ntu-dating-platform`
- [ ] **Production Branch**: `main`
- [ ] **Root Directory**: `final-project` ⚠️ **必須設定**

### GitHub Repository
- [ ] Repository 可訪問
- [ ] `main` branch 存在
- [ ] 最新的 commit (`bae8a75`) 已推送
- [ ] Webhook 已設定（Settings → Webhooks）

## 🎯 快速修復步驟（推薦順序）

### 第一步：檢查 Root Directory
1. 前往：https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/settings/general
2. 確認 **Root Directory** 為 `final-project`
3. 如果不是，設定為 `final-project` 並保存

### 第二步：檢查 Git 連接
1. 前往：https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/settings/git
2. 確認 Repository 和 Branch 設定正確
3. 確認 Root Directory 也設定為 `final-project`

### 第三步：觸發測試部署
推送一個新的 commit 來測試：

```bash
cd "/home/denny/下載/網路服務程式設計/wp1141/final-project"
git commit --allow-empty -m "測試：修復 Vercel 自動部署"
git push ntu-dating main
```

### 第四步：檢查部署狀態
1. 前往：https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/deployments
2. 應該在 10-30 秒內看到新的部署
3. 如果沒有，執行方法 2（重新連接 Git）

## 🚨 常見錯誤訊息

### 錯誤 1: "Cannot find package.json"
**原因**: Root Directory 設定錯誤
**解決**: 設定 Root Directory 為 `final-project`

### 錯誤 2: "No deployments found"
**原因**: Git 連接斷開或 Webhook 失效
**解決**: 重新連接 Git Repository

### 錯誤 3: "Build failed"
**原因**: 環境變數缺失或構建錯誤
**解決**: 檢查 Build Logs 和環境變數設定

## 📝 重要提醒

**Root Directory 是最關鍵的設定！**

因為專案在 `final-project/` 子目錄中，Vercel 必須知道從哪裡開始建置。

**正確設定**：
- Root Directory：`final-project`

**錯誤設定**：
- Root Directory：留空或 `/`（會導致找不到 `package.json`）
- Root Directory：`/final-project`（多餘的斜線）

## ✅ 驗證修復

修復後，應該看到：
1. 新的部署出現在 Vercel Dashboard
2. 部署狀態為 **Building** → **Ready**
3. 部署來源顯示為 **Git Push**
4. 部署時間為剛才推送的時間

