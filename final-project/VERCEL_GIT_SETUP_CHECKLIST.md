# Vercel 與 GitHub 連接檢查清單

## 🔍 逐步檢查指南

### 步驟 1: 檢查本地 Git 配置

#### 1.1 檢查 Remote 設定

在終端機執行：
```bash
cd "/home/denny/下載/網路服務程式設計/wp1141/final-project"
git remote -v
```

**預期結果**：
```
ntu-dating	git@github.com:rejoice101201-cyber/ntu-dating-platform.git (fetch)
ntu-dating	git@github.com:rejoice101201-cyber/ntu-dating-platform.git (push)
origin	git@github.com:rejoice101201-cyber/wp1141.git (fetch)
origin	git@github.com:rejoice101201-cyber/wp1141.git (push)
```

#### 1.2 檢查最近的 Commits

```bash
# 本地 commits
git log --oneline -5

# 遠端 commits
git log ntu-dating/main --oneline -5
```

**確認**：
- 最新的 commit 應該是：`db422d3 觸發 Vercel 部署測試`
- 本地和遠端的 commits 應該一致

---

### 步驟 2: 檢查 GitHub Repository

#### 2.1 訪問 GitHub Repository

訪問：https://github.com/rejoice101201-cyber/ntu-dating-platform

#### 2.2 確認內容

檢查以下項目：
- [ ] Repository 存在且可訪問
- [ ] `main` branch 存在
- [ ] 最新的 commit 是 `觸發 Vercel 部署測試`
- [ ] 有 `final-project/` 目錄（如果專案在子目錄）

#### 2.3 檢查 Repository 設定

在 GitHub Repository → Settings：
- [ ] 確認 Repository 是 Public 或您有權限訪問
- [ ] 檢查 Webhooks（Settings → Webhooks）
  - 應該有 Vercel 的 webhook
  - 狀態應該是 Active

---

### 步驟 3: 檢查 Vercel 設定

#### 3.1 訪問 Vercel Dashboard

訪問：https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform

#### 3.2 檢查 Git 連接（最重要）

前往：**Settings** → **Git**

檢查以下項目：

**a. Repository 連接**
- [ ] **Repository** 應該顯示：`rejoice101201-cyber/ntu-dating-platform`
- [ ] 如果顯示 "Connect Git" 或沒有連接：
  - 點擊 **Connect Git Repository**
  - 選擇 `rejoice101201-cyber/ntu-dating-platform`
  - 確認連接

**b. Production Branch**
- [ ] 應該設定為：`main`

**c. Root Directory**
- [ ] **非常重要**：應該設定為：`final-project`
- [ ] 如果沒有設定或設定錯誤：
  - 點擊 **Edit**
  - 輸入：`final-project`
  - 點擊 **Save**

#### 3.3 檢查 General 設定

前往：**Settings** → **General**

檢查：
- [ ] **Root Directory**：`final-project`
- [ ] **Framework Preset**：Next.js
- [ ] **Build Command**：`npm run build`（或自動偵測）
- [ ] **Output Directory**：`.next`（或自動偵測）

#### 3.4 檢查 Deployments

前往：**Deployments** 標籤

檢查：
- [ ] 最新的部署時間
- [ ] 部署狀態（Ready / Building / Error）
- [ ] 部署來源（Git Push / Manual）

---

### 步驟 4: 重新連接 Git（如果需要）

如果 Vercel 顯示 "Connect Git"：

#### 4.1 斷開現有連接

1. 前往 **Settings** → **Git**
2. 如果已連接，點擊 **Disconnect**
3. 確認斷開

#### 4.2 重新連接

1. 點擊 **Connect Git Repository**
2. 選擇 **GitHub**
3. 授權 Vercel 訪問 GitHub（如果需要）
4. 選擇 Repository：`rejoice101201-cyber/ntu-dating-platform`
5. 確認連接

#### 4.3 設定 Root Directory

連接後：
1. 在 **Root Directory** 欄位輸入：`final-project`
2. 點擊 **Save**

#### 4.4 觸發首次部署

連接完成後，Vercel 應該會自動觸發部署。如果沒有：
1. 前往 **Deployments**
2. 點擊 **Redeploy**（如果有的話）
3. 或推送一個新的 commit

---

### 步驟 5: 驗證連接

#### 5.1 推送測試 Commit

```bash
cd "/home/denny/下載/網路服務程式設計/wp1141/final-project"

# 創建測試 commit
git commit --allow-empty -m "測試 Vercel 自動部署"

# 推送到 GitHub
git push ntu-dating main
```

#### 5.2 檢查 Vercel Dashboard

推送後：
1. 立即前往 Vercel Dashboard → Deployments
2. 應該在 10-30 秒內看到新的部署開始
3. 部署狀態會顯示：**Building**

如果沒有看到新部署：
- 檢查 Root Directory 是否正確
- 檢查 Git 連接是否正常
- 檢查 GitHub Webhook 是否設定

---

## 🚨 常見問題

### 問題 1: Vercel 顯示 "Connect Git"

**原因**：Git repository 沒有連接或連接已斷開

**解決方法**：
1. 前往 Settings → Git
2. 點擊 **Connect Git Repository**
3. 選擇正確的 repository
4. 設定 Root Directory 為 `final-project`

### 問題 2: 推送後沒有自動部署

**可能原因**：
1. Root Directory 設定錯誤
2. GitHub Webhook 未設定
3. 推送到了錯誤的 branch

**解決方法**：
1. 確認 Root Directory 是 `final-project`
2. 確認 Production Branch 是 `main`
3. 確認推送到了 `main` branch
4. 檢查 GitHub Webhooks（Settings → Webhooks）

### 問題 3: Root Directory 設定錯誤

**症狀**：
- 部署失敗
- 找不到 `package.json`
- Build 錯誤

**解決方法**：
1. Settings → General → Root Directory
2. 設定為：`final-project`
3. 重新部署

### 問題 4: GitHub Webhook 未設定

**檢查方法**：
1. GitHub Repository → Settings → Webhooks
2. 應該看到 Vercel 的 webhook
3. 狀態應該是 Active

**如果沒有**：
- Vercel 會在連接 Git 時自動設定
- 或手動在 Vercel Settings → Git 中重新連接

---

## ✅ 完整檢查清單

### Git 配置
- [ ] Remote `ntu-dating` 指向正確的 repository
- [ ] 本地和遠端的 commits 同步
- [ ] 已推送到 `main` branch

### GitHub Repository
- [ ] Repository 可訪問
- [ ] `main` branch 存在
- [ ] 最新的 commit 已推送
- [ ] Webhook 已設定（可選，Vercel 會自動設定）

### Vercel 設定
- [ ] Git Repository 已連接：`rejoice101201-cyber/ntu-dating-platform`
- [ ] Production Branch：`main`
- [ ] **Root Directory：`final-project`** ⚠️ 最重要
- [ ] Framework：Next.js
- [ ] Build Command：正確設定

### 部署狀態
- [ ] 推送後有自動部署
- [ ] 部署狀態正常（Ready）
- [ ] 沒有 Build 錯誤

---

## 🎯 下一步

完成檢查後：

1. **如果 Git 未連接**：
   - 在 Vercel 中連接 Git Repository
   - 設定 Root Directory 為 `final-project`

2. **如果已連接但沒有自動部署**：
   - 確認 Root Directory 設定正確
   - 推送一個新的 commit 測試

3. **如果部署失敗**：
   - 檢查 Build Logs
   - 確認環境變數已設定
   - 確認 `package.json` 存在於 `final-project/` 目錄

---

## 📝 重要提醒

**Root Directory 設定**是最常見的問題！

因為您的專案在 `final-project/` 子目錄中，Vercel 必須知道從哪裡開始建置。

**正確設定**：
- Root Directory：`final-project`

**錯誤設定**：
- Root Directory：留空或 `/`
- 這會導致 Vercel 找不到 `package.json` 和專案文件

