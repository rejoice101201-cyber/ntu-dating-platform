# 恢復可運行版本指南

## 🎯 目標

恢復到之前可以成功運行的版本（commit `aa3a636`），確保可以在 Vercel 上正常部署。

## 🔍 問題分析

### 當前狀況
- ❌ 最新部署都失敗（Error）
- ✅ 2-3 天前的部署成功（commit `aa3a636`）
- ✅ `frontend/` 目錄包含之前成功的版本
- ❌ `final-project/` 目錄部署失敗

### 解決方案

將之前成功的版本（`frontend/`）恢復到 `final-project/`，確保可以正常部署。

## 🛠️ 恢復步驟

### 方案 1: 將 frontend 內容複製到 final-project（推薦）

#### 步驟 1: 備份當前 final-project
```bash
cd "/home/denny/下載/網路服務程式設計/wp1141"
# 創建備份
cp -r final-project final-project-backup
```

#### 步驟 2: 從成功版本恢復
```bash
cd "/home/denny/下載/網路服務程式設計/wp1141"

# 從 aa3a636 恢復 frontend 到 final-project
git checkout aa3a636 -- frontend/

# 將 frontend 的內容複製到 final-project
rm -rf final-project/*
cp -r frontend/* final-project/
```

#### 步驟 3: 提交恢復
```bash
cd "/home/denny/下載/網路服務程式設計/wp1141"
git add final-project/
git commit -m "恢復：將成功版本（frontend）恢復到 final-project"
git push ntu-dating main
```

### 方案 2: 直接使用 frontend 作為生產環境（更簡單）

#### 步驟 1: 更新 Vercel Root Directory
1. 前往 Vercel Settings → Build and Deployment
2. 將 Root Directory 改為：`frontend`
3. 點擊 Save

#### 步驟 2: 觸發部署
Vercel 會自動觸發部署，使用 `frontend/` 目錄。

## 📋 推薦流程

### 立即行動（方案 2 - 更簡單）

1. **更新 Vercel Root Directory**：
   - 前往 Settings → Build and Deployment
   - 將 Root Directory 從 `final-project` 改為 `frontend`
   - 點擊 Save

2. **等待自動部署**：
   - Vercel 會自動觸發部署
   - 使用之前成功的 `frontend/` 版本

3. **驗證部署**：
   - 檢查 Deployments 頁面
   - 確認部署成功（狀態為 Ready）
   - 訪問網站確認功能正常

### 如果方案 2 不行，使用方案 1

如果直接使用 `frontend` 有問題，可以將 `frontend` 的內容複製到 `final-project`。

## ✅ 檢查清單

### 恢復前
- [ ] 確認 `frontend/` 目錄存在且完整
- [ ] 確認 `frontend/` 包含之前成功的版本

### 恢復後
- [ ] Vercel Root Directory 設定正確
- [ ] 部署成功（狀態為 Ready）
- [ ] 網站功能正常

## 🎯 立即行動

**最簡單的方法**：
1. 前往 Vercel Settings → Build and Deployment
2. 將 Root Directory 改為：`frontend`
3. 點擊 Save
4. 等待自動部署完成

這樣就可以立即恢復到之前成功的版本！

