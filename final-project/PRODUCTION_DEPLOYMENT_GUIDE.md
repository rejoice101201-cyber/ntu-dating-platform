# 生產環境部署指南 - final-project

## 🎯 目標

- ✅ 使用 `final-project` 作為**唯一的生產環境**
- ✅ 保留 `frontend/` 作為備份（不刪除，但不用於部署）
- ✅ 確保 Vercel 正確部署 `final-project`
- ✅ 不破壞現有成功部署

## 📁 當前檔案結構

```
ntu-dating-platform/
├── package.json          # 根目錄 package.json（monorepo 管理，可選）
├── frontend/             # 之前成功部署的版本（保留作為備份）
│   ├── package.json
│   ├── app/
│   └── ...
├── final-project/        # 當前生產環境（Vercel 已成功部署）
│   ├── package.json
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── models/
│   └── ...
├── README.md
├── .gitignore
└── LICENSE
```

## ✅ 當前狀態確認

### Vercel 部署狀態
- ✅ Vercel 已成功部署 `final-project`
- ✅ Root Directory 設定為：`final-project`
- ✅ 部署狀態：Ready

### 檔案結構狀態
- ✅ `final-project/` 目錄完整（生產環境）
- ✅ `frontend/` 目錄保留（備份，不影響部署）

## 🎯 Vercel 設定確認

### 步驟 1: 確認 Root Directory 設定

1. **前往 Vercel Settings → Build and Deployment**：
   ```
   https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/settings/build-and-deployment
   ```

2. **確認 Root Directory**：
   - 應該顯示：`final-project`
   - 如果不是，設定為 `final-project` 並保存

### 步驟 2: 確認 Git 連接

1. **前往 Vercel Settings → Git**：
   ```
   https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/settings/git
   ```

2. **確認設定**：
   - Repository: `rejoice101201-cyber/ntu-dating-platform`
   - Production Branch: `main`
   - Root Directory: `final-project`（如果有的話）

### 步驟 3: 驗證自動部署

1. **推送測試 commit**：
   ```bash
   cd "/home/denny/下載/網路服務程式設計/wp1141/final-project"
   git commit --allow-empty -m "測試：驗證 final-project 自動部署"
   git push ntu-dating main
   ```

2. **檢查部署**：
   - 前往 Deployments 頁面
   - 應該在 10-30 秒內看到新的部署
   - 確認部署成功（狀態為 Ready）

## 📋 檔案結構整理建議

### 當前結構（已確認）

```
ntu-dating-platform/
├── package.json          # 根目錄（monorepo，可選保留）
├── frontend/             # 備份版本（保留，不刪除）
│   └── ...              # 之前成功部署的版本
├── final-project/        # 生產環境（當前使用）
│   ├── package.json
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── models/
│   └── ...
├── README.md            # 專案說明
├── .gitignore
└── LICENSE
```

### 結構說明

#### `final-project/`（生產環境）
- ✅ **當前 Vercel 部署的目錄**
- ✅ 包含完整的 Next.js 專案
- ✅ 使用 MongoDB + Mongoose
- ✅ 使用 NextAuth v5

#### `frontend/`（備份）
- ✅ **保留作為備份**，不刪除
- ✅ 之前成功部署的版本
- ✅ 使用 Prisma
- ✅ 如果需要可以隨時恢復

#### 根目錄 `package.json`
- ⚠️ **可選保留**，用於 monorepo 管理
- ⚠️ 如果不需要，可以刪除
- ⚠️ 不影響 Vercel 部署（因為 Root Directory 是 `final-project`）

## 🛠️ 可選：清理根目錄（如果需要）

如果您想讓結構更清晰，可以考慮：

### 選項 1: 保留根目錄 package.json（推薦）
- ✅ 保留，不影響部署
- ✅ 可以用於本地開發管理

### 選項 2: 刪除根目錄 package.json
如果確定不需要 monorepo 管理：

```bash
cd "/home/denny/下載/網路服務程式設計/wp1141"
git rm package.json
git commit -m "清理：移除根目錄 package.json（不再需要 monorepo）"
git push ntu-dating main
```

## ✅ Vercel 重新部署步驟

### 如果 Vercel 已經成功部署 `final-project`

**不需要做任何事！** 當前設定已經正確。

### 如果需要重新部署

#### 方法 1: 自動部署（推薦）

1. **推送新的 commit**：
   ```bash
   cd "/home/denny/下載/網路服務程式設計/wp1141/final-project"
   git commit --allow-empty -m "觸發重新部署"
   git push ntu-dating main
   ```

2. **Vercel 會自動觸發部署**

#### 方法 2: 手動觸發部署

1. **前往 Deployments 頁面**：
   ```
   https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/deployments
   ```

2. **點擊 "Create Deployment"**

3. **選擇設定**：
   - Branch: `main`
   - Root Directory: `final-project`（會自動使用專案設定）

4. **點擊 "Deploy"**

## 📋 完整檢查清單

### 檔案結構
- [x] `final-project/` 目錄完整
- [x] `frontend/` 目錄保留（備份）
- [ ] 根目錄 `package.json`（可選，決定是否保留）

### Vercel 設定
- [ ] Root Directory 設定為：`final-project`
- [ ] Git 連接正常
- [ ] Production Branch 為：`main`
- [ ] 環境變數已設定

### 部署驗證
- [ ] 當前部署狀態為 Ready
- [ ] 網站可以正常訪問
- [ ] 自動部署功能正常

## 🎯 推薦行動

### 立即行動

1. **確認 Vercel Root Directory**：
   - 前往 Settings → Build and Deployment
   - 確認 Root Directory 為：`final-project`
   - 如果不是，設定並保存

2. **驗證當前部署**：
   - 訪問網站：https://ntu-dating-platform-kappa.vercel.app
   - 確認功能正常

3. **測試自動部署**：
   - 推送一個測試 commit
   - 確認自動部署觸發

### 可選行動

1. **決定是否保留根目錄 package.json**：
   - 如果不需要 monorepo 管理，可以刪除
   - 如果保留，不影響部署

2. **整理文檔**：
   - 更新 README.md 說明當前結構
   - 記錄 `frontend/` 是備份版本

## ⚠️ 重要提醒

### 關於 frontend 目錄
- ✅ **不要刪除** `frontend/` 目錄
- ✅ 保留作為備份，以防需要恢復
- ✅ 不影響 Vercel 部署（因為 Root Directory 是 `final-project`）

### 關於根目錄 package.json
- ⚠️ 保留或刪除都可以
- ⚠️ 不影響 Vercel 部署
- ⚠️ 如果保留，可以用於本地開發管理

### 關於 Vercel 設定
- ✅ Root Directory 必須是：`final-project`
- ✅ 這樣 Vercel 會從 `final-project/` 目錄開始建置
- ✅ `frontend/` 目錄不會被使用

## ✅ 總結

### 當前狀態
- ✅ Vercel 已成功部署 `final-project`
- ✅ 檔案結構清晰
- ✅ `frontend/` 保留作為備份

### 需要確認
- [ ] Vercel Root Directory 設定為 `final-project`
- [ ] 自動部署功能正常
- [ ] 網站功能正常

### 不需要做
- ❌ 不需要刪除 `frontend/` 目錄
- ❌ 不需要創建新專案
- ❌ 不需要改變檔案結構

**只要確認 Vercel Root Directory 設定為 `final-project`，一切就正常運作了！**

