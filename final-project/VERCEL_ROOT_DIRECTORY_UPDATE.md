# Vercel Root Directory 更新指南

## ✅ 已恢復的結構

我們已經從成功部署的版本（`aa3a636`）恢復了：
- ✅ `frontend/` 目錄（Next.js 專案）
- ✅ 根目錄的 `package.json`（monorepo 管理）

## 🎯 更新 Vercel Root Directory

### 步驟 1: 前往 Build and Deployment 設定

1. 前往 Vercel Settings → Build and Deployment：
   ```
   https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/settings/build-and-deployment
   ```

### 步驟 2: 更新 Root Directory

1. 找到 **Root Directory** 輸入框
2. **將值從 `final-project` 改為 `frontend`**
3. 點擊 **Save**

### 步驟 3: 驗證部署

1. Vercel 會自動觸發新的部署
2. 前往 Deployments 頁面查看部署狀態
3. 確認部署成功（狀態為 Ready）

## 📋 當前結構

```
ntu-dating-platform/
├── package.json          # 根目錄 package.json（已恢復）
├── frontend/             # Next.js 專案（已恢復）
│   ├── package.json
│   ├── app/
│   ├── components/
│   └── ...
├── final-project/        # 另一個專案（保留）
│   ├── package.json
│   └── ...
├── README.md
├── .gitignore
└── LICENSE
```

## ⚠️ 重要提醒

### Root Directory 設定
- **之前成功部署**：Root Directory 為 **`frontend`** 或 **空的**
- **現在應該設定為**：**`frontend`**

### 關於 final-project
- `final-project/` 是另一個專案（使用 MongoDB + Mongoose）
- `frontend/` 是之前成功部署的專案（使用 Prisma）
- 兩個專案可以並存，但 Vercel 應該部署 `frontend/`

## ✅ 檢查清單

### Git 恢復
- [x] 已恢復 `frontend/` 目錄
- [x] 已恢復根目錄 `package.json`
- [x] 已提交並推送到 GitHub

### Vercel 設定
- [ ] 前往 Settings → Build and Deployment
- [ ] 將 Root Directory 從 `final-project` 改為 `frontend`
- [ ] 點擊 Save
- [ ] 確認自動觸發部署

### 部署驗證
- [ ] 檢查 Deployments 頁面
- [ ] 確認新部署成功
- [ ] 確認網站正常運作

## 🎯 下一步

1. **更新 Vercel Root Directory 為 `frontend`**
2. **等待自動部署完成**
3. **驗證網站恢復正常**

完成後，網站應該會恢復到 3 天前成功部署的狀態！

