# 回退到成功部署版本指南

## 📊 當前狀況

根據 Deployments 頁面：
- ✅ **3 天前成功部署**：`aa3a636` - "feat: 添加配对条件设置功能（性别、年龄范围）"
- ❌ **之後的部署都失敗**：包括最新的 `e567222` 等

## 🎯 回退方法

有兩種方式可以回退到成功的版本：

### 方法 1: 在 Vercel 中直接回退（推薦，更安全）

這是最簡單和安全的方法，不會影響 Git 歷史。

#### 步驟 1.1: 在 Deployments 頁面找到成功的部署

1. 前往 Vercel Deployments 頁面
2. 找到 3 天前的成功部署：
   - Commit: `aa3a636`
   - 訊息: "feat: 添加配对条件设置功能（性别、年龄范围）"
   - 狀態: ✅ Deployed (綠色勾號)

#### 步驟 1.2: 回退到該部署

1. **點擊該部署**（`aa3a636`）
2. 在部署詳情頁面中，找到 **"Promote to Production"** 或 **"Redeploy"** 按鈕
3. 點擊該按鈕
4. 確認回退操作

#### 步驟 1.3: 驗證回退

回退後：
- ✅ 生產環境會使用該版本的代碼
- ✅ 網站會恢復到 3 天前的狀態
- ✅ Git 歷史不會改變

### 方法 2: 在 Git 中回退（會改變 Git 歷史）

如果您想要在 Git 中也回退，可以使用以下方法：

#### 選項 A: 使用 git revert（推薦，保留歷史）

```bash
cd "/home/denny/下載/網路服務程式設計/wp1141/final-project"

# 查看當前 HEAD 和目標 commit 之間的差異
git log --oneline aa3a636..HEAD

# 創建一個 revert commit，回退到 aa3a636
# 這會保留所有歷史記錄
git revert --no-commit aa3a636..HEAD
git commit -m "回退到成功部署版本 aa3a636"
git push ntu-dating main
```

#### 選項 B: 使用 git reset（會丟失歷史，不推薦）

⚠️ **警告**：這會丟失 aa3a636 之後的所有 commits！

```bash
cd "/home/denny/下載/網路服務程式設計/wp1141/final-project"

# 回退到 aa3a636（保留工作區）
git reset --soft aa3a636

# 或完全回退（丟棄所有變更）
git reset --hard aa3a636

# 強制推送（危險！）
git push ntu-dating main --force
```

## 📋 推薦流程

### 第一步：在 Vercel 中回退（立即生效）

1. 前往 Deployments 頁面
2. 找到成功的部署 `aa3a636`
3. 點擊部署進入詳情頁
4. 點擊 **"Promote to Production"** 或 **"Redeploy"**
5. 確認操作

### 第二步：驗證回退

1. 檢查網站是否恢復正常
2. 確認功能正常運作
3. 檢查部署狀態為 Ready

### 第三步：決定是否在 Git 中回退

- **如果只是暫時回退**：只使用方法 1（Vercel 回退）即可
- **如果想要永久回退**：使用方法 2（Git 回退）

## ⚠️ 重要提醒

### 關於 Vercel 回退
- ✅ 不會影響 Git 歷史
- ✅ 可以隨時切換回其他版本
- ✅ 更安全，可以撤銷

### 關於 Git 回退
- ⚠️ 會改變 Git 歷史
- ⚠️ 如果使用 `git reset --hard`，會丟失所有變更
- ⚠️ 如果使用 `git push --force`，會覆蓋遠端歷史
- ⚠️ 建議先備份或創建新分支

## 🎯 推薦行動

**立即行動**：
1. 在 Vercel 中回退到 `aa3a636`（方法 1）
2. 驗證網站恢復正常
3. 之後再決定是否在 Git 中回退

**如果需要在 Git 中回退**：
- 使用 `git revert`（保留歷史）
- 避免使用 `git reset --hard`（會丟失變更）

## ✅ 驗證清單

### Vercel 回退後
- [ ] 生產環境使用 `aa3a636` 版本
- [ ] 網站功能正常
- [ ] 部署狀態為 Ready

### Git 回退後（如果執行）
- [ ] 本地代碼回退到 `aa3a636`
- [ ] 遠端代碼已更新
- [ ] 確認沒有重要變更丟失

