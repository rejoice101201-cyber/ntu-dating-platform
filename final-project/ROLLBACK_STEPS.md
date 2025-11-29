# 回退到成功部署版本 - 詳細步驟

## 🎯 目標
回退到 3 天前成功的部署版本：`aa3a636` - "feat: 添加配对条件设置功能（性别、年龄范围）"

## 📋 方法 1: 在 Vercel 中回退（推薦）

### 步驟 1: 前往 Deployments 頁面
1. 打開瀏覽器，前往 Vercel Dashboard
2. 選擇專案：`ntu-dating-platform`
3. 點擊頂部導航欄的 **"Deployments"** 標籤

### 步驟 2: 找到成功的部署
1. 在部署列表中，找到以下部署：
   - **Commit**: `aa3a636` 或 `aa3a63649d6d0ae5...`
   - **訊息**: "feat: 添加配对条件设置功能（性别、年龄范围）"
   - **狀態**: ✅ **Deployed**（綠色勾號）
   - **時間**: 3 days ago 或 last week
   - **目標**: "Deployed to Production - ntu-dating-platform by vercel"

2. **點擊該部署**（點擊整個部署行或部署 ID）

### 步驟 3: 回退到該版本
1. 在部署詳情頁面中，找到以下按鈕之一：
   - **"Promote to Production"** 按鈕
   - **"Redeploy"** 按鈕
   - **"..."** 選單中的 "Promote to Production" 選項

2. **點擊該按鈕**

3. 如果出現確認對話框：
   - 確認要回退到該版本
   - 點擊 **"Confirm"** 或 **"Promote"**

### 步驟 4: 等待部署完成
1. 返回 Deployments 頁面
2. 應該會看到新的部署開始（狀態為 Building）
3. 等待部署完成（狀態變為 Ready）
4. 部署完成後，生產環境會使用 `aa3a636` 版本的代碼

### 步驟 5: 驗證回退
1. 訪問您的網站：
   - https://ntu-dating-platform-kappa.vercel.app
2. 測試網站功能是否正常
3. 確認網站已恢復到 3 天前的狀態

## 📋 方法 2: 在 Git 中回退（可選）

如果您想要在 Git 中也回退，可以使用以下步驟：

### 步驟 1: 確認當前狀態
```bash
cd "/home/denny/下載/網路服務程式設計/wp1141/final-project"

# 查看當前 commit
git log --oneline -1

# 查看目標 commit
git log --oneline aa3a636 -1
```

### 步驟 2: 創建回退 commit（推薦方法）
```bash
# 創建一個 revert commit，回退所有 aa3a636 之後的變更
# 這會保留所有歷史記錄
git revert --no-commit aa3a636..HEAD

# 提交回退
git commit -m "回退到成功部署版本 aa3a636"

# 推送到 GitHub
git push ntu-dating main
```

### 步驟 3: 驗證回退
1. 檢查 GitHub 是否有新的 commit
2. 檢查 Vercel 是否自動觸發部署
3. 確認部署成功

## ⚠️ 注意事項

### 關於 Vercel 回退
- ✅ 不會影響 Git 歷史
- ✅ 可以隨時切換回其他版本
- ✅ 更安全，可以撤銷
- ✅ 立即生效

### 關於 Git 回退
- ⚠️ 會改變 Git 歷史
- ⚠️ 如果使用 `git revert`，會保留歷史但創建新 commit
- ⚠️ 如果使用 `git reset --hard`，會丟失所有變更（不推薦）
- ⚠️ 建議先備份（已創建 `backup-before-rollback` 分支）

## 🎯 推薦流程

### 立即行動（推薦）
1. **在 Vercel 中回退**（方法 1）
   - 立即恢復網站
   - 不影響 Git 歷史
   - 可以隨時切換

2. **驗證網站功能**
   - 確認網站正常運作
   - 測試主要功能

3. **之後決定是否在 Git 中回退**
   - 如果只是暫時回退：只使用方法 1 即可
   - 如果想要永久回退：使用方法 2

## ✅ 檢查清單

### Vercel 回退
- [ ] 前往 Deployments 頁面
- [ ] 找到成功的部署 `aa3a636`
- [ ] 點擊部署進入詳情頁
- [ ] 點擊 "Promote to Production" 或 "Redeploy"
- [ ] 確認操作
- [ ] 等待部署完成
- [ ] 驗證網站恢復正常

### Git 回退（如果執行）
- [ ] 確認當前狀態
- [ ] 執行 git revert
- [ ] 推送到 GitHub
- [ ] 確認 Vercel 自動部署
- [ ] 驗證部署成功

## 📝 重要提醒

**最安全的做法**：
1. 先在 Vercel 中回退（立即恢復網站）
2. 驗證網站功能正常
3. 之後再決定是否在 Git 中回退

**如果 Vercel 回退後網站正常**：
- 可以暫時保持這樣
- 之後修復問題後再更新

**如果需要在 Git 中回退**：
- 使用 `git revert`（保留歷史）
- 避免使用 `git reset --hard`（會丟失變更）

