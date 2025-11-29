# Root Directory 設定修正指南

## 🔍 問題發現

### 之前成功部署的結構（commit `aa3a636`）
```
ntu-dating-platform/
├── package.json          # 根目錄的 package.json（管理 monorepo）
├── frontend/             # Next.js 專案目錄
│   ├── package.json      # Next.js 專案的 package.json
│   ├── app/
│   ├── components/
│   └── ...
├── backend/              # 後端目錄
└── ...
```

**Root Directory 設定**：應該是 **空的**（根目錄）或 **`frontend`**

### 清理後的結構
```
ntu-dating-platform/
├── README.md
├── .gitignore
├── LICENSE
└── final-project/        # 所有專案代碼
    ├── package.json
    ├── app/
    ├── components/
    └── ...
```

**當前 Root Directory 設定**：`final-project`

## 🎯 解決方案

有兩種方式可以解決：

### 方案 1: 恢復之前的結構（推薦）

恢復 `frontend/` 目錄和根目錄的 `package.json`，這樣可以保持與之前成功部署的版本一致。

#### 步驟 1: 從 Git 恢復 frontend 目錄
```bash
cd "/home/denny/下載/網路服務程式設計/wp1141"

# 從 aa3a636 恢復 frontend 目錄
git checkout aa3a636 -- frontend/

# 恢復根目錄的 package.json
git checkout aa3a636 -- package.json
```

#### 步驟 2: 確認結構
```bash
# 確認 frontend 目錄存在
ls -la frontend/

# 確認根目錄有 package.json
ls -la package.json
```

#### 步驟 3: 提交恢復
```bash
git add frontend/ package.json
git commit -m "恢復：恢復 frontend 目錄和根目錄 package.json 以匹配成功部署版本"
git push ntu-dating main
```

#### 步驟 4: 更新 Vercel Root Directory
1. 前往 Vercel Settings → Build and Deployment
2. 將 **Root Directory** 改為：**`frontend`**（或留空）
3. 點擊 Save
4. Vercel 會自動觸發部署

### 方案 2: 確認 final-project 是否就是之前的 frontend

如果 `final-project/` 就是之前的 `frontend/` 的內容，那麼：
- 當前設定（Root Directory: `final-project`）是正確的
- 但需要確認 `final-project/` 的內容是否完整

#### 檢查步驟
```bash
cd "/home/denny/下載/網路服務程式設計/wp1141/final-project"

# 檢查是否有 Next.js 專案的必要文件
ls -la package.json next.config.ts app/layout.tsx

# 與 aa3a636 的 frontend 比較
cd ..
git diff aa3a636:frontend/package.json final-project/package.json
```

## 📋 推薦流程

### 立即行動

1. **檢查 final-project 是否就是 frontend**
   - 比較 `final-project/` 和 `aa3a636:frontend/` 的內容
   - 如果相同，當前設定正確
   - 如果不同，需要恢復 frontend 目錄

2. **如果 final-project 不是 frontend**：
   - 執行方案 1（恢復 frontend 目錄）
   - 更新 Vercel Root Directory 為 `frontend`

3. **如果 final-project 就是 frontend**：
   - 保持當前設定（Root Directory: `final-project`）
   - 確認所有文件完整

## ⚠️ 重要提醒

### 關於清理操作
- 我們清理時**刪除**了 `frontend/` 和 `backend/` 目錄
- 我們**保留**了 `final-project/` 目錄
- 但 `final-project/` 可能不是之前部署的 `frontend/` 目錄

### 關於 Root Directory
- 之前成功部署：Root Directory 可能是 **空的** 或 **`frontend`**
- 現在設定：Root Directory 為 **`final-project`**
- 需要確認 `final-project/` 是否就是之前的 `frontend/`

## 🔍 診斷步驟

### 步驟 1: 比較結構
```bash
cd "/home/denny/下載/網路服務程式設計/wp1141"

# 檢查 aa3a636 時 frontend 的結構
git ls-tree -r --name-only aa3a636 | grep "^frontend/" | head -20

# 檢查當前 final-project 的結構
find final-project -type f | head -20
```

### 步驟 2: 比較 package.json
```bash
# 查看 aa3a636 時 frontend 的 package.json
git show aa3a636:frontend/package.json

# 查看當前 final-project 的 package.json
cat final-project/package.json
```

### 步驟 3: 決定方案
- 如果相同：保持當前設定
- 如果不同：恢復 frontend 目錄

## ✅ 檢查清單

### 結構檢查
- [ ] 確認 `final-project/` 是否就是之前的 `frontend/`
- [ ] 比較 package.json 是否相同
- [ ] 檢查關鍵文件是否存在

### 恢復檢查（如果需要）
- [ ] 從 Git 恢復 frontend 目錄
- [ ] 恢復根目錄 package.json
- [ ] 提交恢復的變更

### Vercel 設定檢查
- [ ] 確認 Root Directory 設定正確
- [ ] 如果恢復 frontend，設定 Root Directory 為 `frontend`
- [ ] 如果保持 final-project，設定 Root Directory 為 `final-project`

