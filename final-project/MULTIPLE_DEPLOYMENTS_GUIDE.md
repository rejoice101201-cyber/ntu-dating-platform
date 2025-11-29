# 同時部署兩個版本的解決方案

## 🎯 目標

- ✅ 保留當前 Root Directory 設定（`final-project`）
- ✅ 同時可以運行之前部署成功的網站（`frontend`）

## 💡 解決方案

有幾種方式可以實現，推薦以下方案：

### 方案 1: 創建兩個 Vercel 專案（推薦）

這是最清晰和獨立的方式，兩個專案互不干擾。

#### 步驟 1.1: 主專案（生產環境）- 使用 `frontend`

1. **保持現有專案設定**：
   - 專案名稱：`ntu-dating-platform`
   - Root Directory：`frontend`
   - 這是生產環境，使用之前成功的版本

2. **更新 Root Directory**：
   - 前往 Settings → Build and Deployment
   - 設定 Root Directory 為：`frontend`
   - 點擊 Save

#### 步驟 1.2: 創建新專案（開發/測試環境）- 使用 `final-project`

1. **創建新 Vercel 專案**：
   - 前往 Vercel Dashboard
   - 點擊 **"Add New..."** → **"Project"**
   - 選擇相同的 GitHub Repository：`rejoice101201-cyber/ntu-dating-platform`

2. **設定新專案**：
   - 專案名稱：`ntu-dating-platform-dev`（或您喜歡的名稱）
   - Root Directory：`final-project`
   - Production Branch：`main`
   - 點擊 **"Deploy"**

3. **設定環境變數**：
   - 複製主專案的所有環境變數到新專案
   - 或使用不同的環境變數（如果需要）

#### 優點
- ✅ 兩個專案完全獨立
- ✅ 可以同時運行和測試
- ✅ 不會互相影響
- ✅ 可以有不同的域名

#### 缺點
- ⚠️ 需要管理兩個專案
- ⚠️ 需要複製環境變數

### 方案 2: 使用 Vercel Preview Deployments

使用 Preview Deployments 來部署 `final-project`，主專案保持 `frontend`。

#### 步驟 2.1: 主專案設定
- Root Directory：`frontend`（生產環境）

#### 步驟 2.2: 手動創建 Preview Deployment
1. 前往 Deployments 頁面
2. 點擊 **"Create Deployment"**
3. 選擇 Branch：`main`
4. 在部署選項中，可以嘗試指定不同的路徑（但 Vercel 可能不支援動態 Root Directory）

#### 限制
- ⚠️ Vercel 的 Root Directory 是專案級別設定，無法在單次部署中動態改變
- ⚠️ 這個方案可能不可行

### 方案 3: 使用 Git 分支（進階）

為 `final-project` 創建一個專門的分支，並為該分支創建新的 Vercel 專案。

#### 步驟 3.1: 創建分支
```bash
cd "/home/denny/下載/網路服務程式設計/wp1141"
git checkout -b final-project-deploy
git push ntu-dating final-project-deploy
```

#### 步驟 3.2: 創建新 Vercel 專案
1. 創建新專案
2. 選擇 Branch：`final-project-deploy`
3. Root Directory：`final-project`

#### 優點
- ✅ 代碼分離清晰
- ✅ 可以獨立開發和部署

#### 缺點
- ⚠️ 需要維護兩個分支
- ⚠️ 需要同步代碼

### 方案 4: 使用 Vercel 的環境變數和構建腳本（複雜）

通過自定義構建腳本來動態選擇目錄，但這需要修改構建流程。

#### 不推薦
- ⚠️ 過於複雜
- ⚠️ 維護困難

## 📋 推薦方案：方案 1（兩個 Vercel 專案）

### 實施步驟

#### 第一步：設定主專案（生產環境）

1. **更新 Root Directory**：
   - 前往：https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/settings/build-and-deployment
   - 將 Root Directory 改為：`frontend`
   - 點擊 Save

2. **驗證部署**：
   - 確認主專案使用 `frontend` 目錄
   - 網站恢復到之前成功的狀態

#### 第二步：創建新專案（開發/測試環境）

1. **創建新專案**：
   - 前往 Vercel Dashboard
   - 點擊 **"Add New..."** → **"Project"**
   - 選擇 Repository：`rejoice101201-cyber/ntu-dating-platform`

2. **設定專案**：
   - 專案名稱：`ntu-dating-platform-final-project`
   - Root Directory：`final-project`
   - Production Branch：`main`
   - Framework：Next.js（自動偵測）

3. **複製環境變數**：
   - 從主專案複製所有環境變數
   - 或根據 `final-project` 的需求設定

4. **部署**：
   - 點擊 **"Deploy"**
   - 等待部署完成

#### 第三步：設定不同的域名（可選）

1. **主專案**：
   - 使用現有域名：`ntu-dating-platform-kappa.vercel.app`

2. **新專案**：
   - 使用自動生成的域名：`ntu-dating-platform-final-project.vercel.app`
   - 或添加自訂域名

## ✅ 最終結構

### 主專案（生產環境）
- **專案名稱**：`ntu-dating-platform`
- **Root Directory**：`frontend`
- **域名**：`ntu-dating-platform-kappa.vercel.app`
- **用途**：生產環境，使用之前成功的版本

### 新專案（開發/測試環境）
- **專案名稱**：`ntu-dating-platform-final-project`
- **Root Directory**：`final-project`
- **域名**：`ntu-dating-platform-final-project.vercel.app`
- **用途**：開發和測試新版本

## 🎯 工作流程

### 日常開發
1. **開發新功能**：在 `final-project/` 中開發
2. **測試新版本**：推送到 GitHub，新專案自動部署
3. **生產環境**：主專案保持穩定，使用 `frontend/`

### 發布新版本
1. **測試完成**：確認新專案運行正常
2. **切換主專案**：將主專案的 Root Directory 改為 `final-project`
3. **或合併代碼**：將 `final-project/` 的代碼合併到 `frontend/`

## 📝 重要提醒

### 關於兩個專案
- ✅ 兩個專案可以同時運行
- ✅ 不會互相影響
- ✅ 可以獨立測試和部署

### 關於環境變數
- ⚠️ 需要為兩個專案分別設定環境變數
- ⚠️ 可以複製主專案的環境變數到新專案
- ⚠️ 或根據需要設定不同的環境變數

### 關於代碼同步
- ⚠️ 兩個專案使用同一個 GitHub Repository
- ⚠️ 推送 commit 會觸發兩個專案的自動部署
- ⚠️ 需要確保兩個目錄的代碼都是有效的

## 🎯 立即行動

### 第一步：設定主專案
1. 前往 Settings → Build and Deployment
2. 將 Root Directory 改為：`frontend`
3. 點擊 Save

### 第二步：創建新專案
1. 前往 Vercel Dashboard
2. 創建新專案
3. 選擇相同的 Repository
4. 設定 Root Directory 為：`final-project`
5. 部署

完成後，您就可以同時運行兩個版本了！

