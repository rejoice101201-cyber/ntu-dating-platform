# 連接正確的 Repository 指南

## 🔍 問題發現

您發現 2 天前連接的是 `wp1141` repository，而不是 `ntu-dating-platform`。這就是為什麼自動部署沒有觸發的原因！

## ✅ 正確的連接步驟

### 步驟 1: 在 Vercel 中連接正確的 Repository

1. **在 Vercel Git Settings 頁面中**：
   - 您已經在 Settings → Git 頁面
   - 應該看到兩個 repository 選項：
     - `ntu-dating-platform` (4m ago) - **這是正確的**
     - `wp1141` (2d ago) - 這是錯誤的

2. **點擊 `ntu-dating-platform` 旁邊的 "Connect" 按鈕**

3. **在連接設定中**：
   - 確認 Repository: `rejoice101201-cyber/ntu-dating-platform`
   - **重要**：找到 **Root Directory** 欄位
   - 輸入：`final-project`
   - 確認 **Production Branch** 為：`main`

4. **點擊 Save 或 Connect**

5. **Vercel 會自動**：
   - 設定 GitHub Webhook
   - 觸發首次部署
   - 啟用自動部署功能

### 步驟 2: 驗證連接

連接完成後，應該會看到：
- Repository 顯示為：`rejoice101201-cyber/ntu-dating-platform`
- 連接時間更新為剛才
- 自動觸發首次部署

### 步驟 3: 測試自動部署

連接完成後，推送一個測試 commit：

```bash
cd "/home/denny/下載/網路服務程式設計/wp1141/final-project"
git commit --allow-empty -m "測試：驗證連接正確 repository 後的自動部署"
git push ntu-dating main
```

然後檢查 Vercel Deployments 頁面，應該會在 10-30 秒內看到新的自動部署。

## 📋 檢查清單

### 連接前
- [ ] 確認當前連接的是錯誤的 repository（`wp1141`）
- [ ] 準備連接到正確的 repository（`ntu-dating-platform`）

### 連接時
- [ ] 點擊 `ntu-dating-platform` 的 Connect 按鈕
- [ ] 設定 Root Directory 為：`final-project`
- [ ] 確認 Production Branch 為：`main`
- [ ] 點擊 Save/Connect

### 連接後
- [ ] 確認 Repository 顯示為：`rejoice101201-cyber/ntu-dating-platform`
- [ ] 確認自動觸發首次部署
- [ ] 推送測試 commit
- [ ] 確認自動部署觸發

## 🎯 預期結果

連接正確的 repository 後：
1. ✅ Vercel 會自動觸發首次部署
2. ✅ 之後每次推送 commit 都會自動觸發部署
3. ✅ Deployments 頁面會顯示新的部署
4. ✅ 部署狀態為 Building → Ready

## ⚠️ 重要提醒

**Root Directory 設定**：
- 在連接 repository 時，**必須**設定 Root Directory 為 `final-project`
- 如果忘記設定，可以在 Settings → Build and Deployment 中補設定
- 但最好在連接時就設定好

**如果連接後沒有自動觸發首次部署**：
- 手動觸發一次部署（Create Deployment）
- 或推送一個新的 commit 測試

## ✅ 總結

問題根源找到了！連接錯誤的 repository 導致自動部署無法觸發。

**解決方法**：
1. 連接到正確的 repository：`ntu-dating-platform`
2. 設定 Root Directory 為：`final-project`
3. 測試自動部署

完成後，自動部署應該會恢復正常！

