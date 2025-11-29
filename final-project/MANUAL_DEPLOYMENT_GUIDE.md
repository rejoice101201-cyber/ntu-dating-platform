# 手動部署指南

## ✅ 設定確認

根據您的截圖，設定都是正確的：
- ✅ Root Directory: `final-project` - **正確**
- ✅ Skip deployments: Disabled - **正確**
- ✅ Git 連接正常

## 🔍 為什麼自動部署沒有觸發？

即使設定正確，自動部署可能沒有觸發的原因：

### 可能原因 1: 需要手動觸發一次來"激活"
有時候 Vercel 需要手動觸發一次部署後，自動部署才會恢復正常。

### 可能原因 2: GitHub Webhook 延遲
Webhook 可能有延遲，需要等待幾分鐘。

### 可能原因 3: 警告訊息
看到 "Configuration Settings in the current Production deployment differ from your current Project Settings" 警告，這表示當前部署使用的設定與專案設定不同。

## 🛠️ 解決方案：手動觸發部署

### 步驟 1: 使用 Create Deployment

1. **在 Create Deployment 對話框中**：
   - 您已經打開了 Create Deployment 對話框
   - 輸入框預填了 repository URL

2. **選擇 Branch**：
   - 點擊 **"main"** 按鈕（帶有分支圖標的按鈕）
   - 這會選擇 `main` branch 的最新 commit

3. **創建部署**：
   - 點擊 **"Create Deployment"** 按鈕
   - Vercel 會使用專案設定中的 Root Directory (`final-project`)

### 步驟 2: 觀察部署結果

部署開始後：
1. 前往 Deployments 頁面
2. 應該會看到新的部署（狀態為 Building）
3. 等待部署完成（狀態變為 Ready）

### 步驟 3: 檢查 Build Logs

如果部署成功：
- ✅ 狀態顯示 Ready
- ✅ 沒有 "Cannot find package.json" 錯誤
- ✅ 網站可以正常訪問

如果部署失敗：
- ❌ 點擊部署查看 Build Logs
- ❌ 檢查錯誤訊息
- ❌ 確認環境變數已設定

## 📋 手動部署後的驗證

### 驗證 1: 確認部署成功
- [ ] 部署狀態為 Ready
- [ ] 沒有 Build 錯誤
- [ ] 網站可以正常訪問

### 驗證 2: 測試自動部署
手動部署成功後，推送新的 commit 測試自動部署：

```bash
cd "/home/denny/下載/網路服務程式設計/wp1141/final-project"
git commit --allow-empty -m "測試：驗證自動部署是否恢復"
git push ntu-dating main
```

然後檢查 Deployments 頁面，應該會在 10-30 秒內看到新的自動部署。

## 🎯 推薦行動

### 立即行動

1. **在 Create Deployment 對話框中**：
   - 點擊 **"main"** 按鈕選擇 branch
   - 點擊 **"Create Deployment"** 創建部署

2. **等待部署完成**：
   - 前往 Deployments 頁面
   - 觀察部署狀態（Building → Ready）

3. **驗證結果**：
   - 如果成功，測試自動部署
   - 如果失敗，檢查 Build Logs

## ⚠️ 關於警告訊息

如果看到 "Configuration Settings in the current Production deployment differ from your current Project Settings"：

**這表示**：
- 當前生產環境的部署使用了舊的設定
- 專案設定已經更新（Root Directory 為 `final-project`）
- 舊的部署還沒有使用新設定

**解決方法**：
- 手動創建新部署（使用新的設定）
- 新部署會使用更新後的 Root Directory 設定

## ✅ 總結

- ✅ 設定都是正確的
- ⏳ 需要手動觸發一次部署來驗證
- 🎯 手動部署成功後，自動部署應該會恢復正常

**請在 Create Deployment 對話框中點擊 "main" 按鈕，然後點擊 "Create Deployment" 來觸發部署。**

