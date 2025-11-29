# Vercel 部署問題排查

## 📊 當前狀況分析

### 已確認的事實
- ✅ 2 天前有成功部署（commit `aa3a636`）
- ✅ Git 連接正常
- ✅ 已推送多個新 commits（`bd176b6`, `82305e6`, `ad63d35`）
- ❌ 新 commits 沒有觸發自動部署

### 可能的原因

#### 原因 1: Root Directory 設定在清理後丟失
**症狀**：
- 之前可以部署（2 天前）
- 清理 repository 後，Root Directory 設定可能被重置
- 新 commits 無法觸發部署（因為找不到 package.json）

**解決方法**：
1. 前往 Settings → Build and Deployment
2. 確認 Root Directory 設定為：`final-project`
3. 如果為空或錯誤，設定並保存

#### 原因 2: "Skip deployments" 選項被啟用
**症狀**：
- Vercel 認為沒有相關變更（因為變更在 `final-project/` 目錄中）
- 如果 Root Directory 未設定，Vercel 會檢查根目錄的變更
- 因為我們清理了根目錄，Vercel 可能認為沒有變更

**解決方法**：
1. 前往 Settings → Build and Deployment
2. 找到 "Skip deployments when there are no changes to the root directory or its dependencies"
3. 確保選項為 **Disabled**
4. 點擊 Save

#### 原因 3: GitHub Webhook 延遲或失效
**症狀**：
- Git 連接正常，但 webhook 沒有觸發
- 新 commits 已推送但 Vercel 沒有收到通知

**解決方法**：
1. 檢查 GitHub Webhooks：
   - https://github.com/rejoice101201-cyber/ntu-dating-platform/settings/hooks
2. 確認 Vercel webhook 狀態為 Active
3. 如果沒有或失效，重新連接 Git

## 🔍 診斷步驟

### 步驟 1: 確認 Root Directory 設定

1. **前往 Build and Deployment 設定**：
   ```
   https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/settings/build-and-deployment
   ```

2. **檢查 Root Directory**：
   - 應該顯示：`final-project`
   - 如果為空或不是 `final-project`，這就是問題所在

3. **檢查 "Skip deployments" 選項**：
   - 應該為 **Disabled**
   - 如果為 Enabled，這就是問題所在

### 步驟 2: 檢查 GitHub Webhook

1. **前往 GitHub Webhooks**：
   ```
   https://github.com/rejoice101201-cyber/ntu-dating-platform/settings/hooks
   ```

2. **確認 Vercel webhook**：
   - 應該看到 Vercel 的 webhook
   - 狀態應該為 Active
   - 最近應該有成功的請求

### 步驟 3: 手動觸發部署測試

如果設定都正確，但還是沒有自動部署：

1. **手動創建部署**：
   - 前往 Deployments 頁面
   - 點擊 **Create Deployment**
   - 選擇 Branch: `main`
   - 點擊 **Deploy**

2. **觀察結果**：
   - 如果手動部署成功，說明設定正確，只是自動觸發有問題
   - 如果手動部署失敗，檢查 Build Logs 找出問題

## 🛠️ 修復方案

### 方案 1: 重新設定 Root Directory（最可能）

1. 前往 Settings → Build and Deployment
2. 設定 Root Directory 為：`final-project`
3. 確保 "Skip deployments" 為 Disabled
4. 點擊 Save
5. 推送新的 commit 測試

### 方案 2: 重新連接 Git

1. 前往 Settings → Git
2. 點擊 **Disconnect**
3. 點擊 **Connect Git Repository**
4. 選擇 Repository：`rejoice101201-cyber/ntu-dating-platform`
5. **重要**：在 Root Directory 欄位輸入：`final-project`
6. 點擊 Save
7. Vercel 會自動觸發首次部署

### 方案 3: 手動觸發部署

如果上述方法都不行：

1. 前往 Deployments 頁面
2. 點擊 **Create Deployment**
3. 選擇 Branch: `main`
4. **不要**設定 Root Directory（會使用專案設定）
5. 點擊 **Deploy**

## 📋 檢查清單

### 設定檢查
- [ ] Root Directory 設定為：`final-project`
- [ ] "Skip deployments" 選項為 Disabled
- [ ] 設定已保存

### Git 檢查
- [x] Repository 連接正常（已確認）
- [ ] GitHub Webhook 狀態為 Active
- [ ] Production Branch 為 `main`

### 部署檢查
- [ ] 手動觸發部署測試
- [ ] 檢查 Build Logs 是否有錯誤
- [ ] 確認部署成功

## 🎯 推薦行動

### 立即行動

1. **確認 Root Directory 設定**（最重要）
   - 前往 Settings → Build and Deployment
   - 確認 Root Directory 為 `final-project`
   - 如果沒有，設定並保存

2. **手動觸發一次部署**
   - 前往 Deployments 頁面
   - 點擊 Create Deployment
   - 選擇 Branch: `main`
   - 點擊 Deploy
   - 觀察是否成功

3. **如果手動部署成功**
   - 推送新的 commit 測試自動部署
   - 如果還是沒有自動觸發，檢查 GitHub Webhook

## 📝 重要提醒

**最可能的原因**：
- 清理 repository 後，Root Directory 設定可能被重置
- 即使之前可以部署，清理後設定可能丟失
- **必須重新確認並設定 Root Directory**

**驗證方法**：
- 手動觸發部署
- 如果成功，說明設定正確
- 如果失敗，檢查 Build Logs 找出問題

