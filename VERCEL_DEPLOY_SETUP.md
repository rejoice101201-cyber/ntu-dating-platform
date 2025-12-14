# Vercel 部署設定指南 - 恢復到 commit aa3a636

## ✅ 當前狀態

- **Frontend 目錄：** 已驗證與 commit `aa3a636` 完全一致
- **技術棧：** Prisma + PostgreSQL, Next.js 14.0.4, JWT 認證
- **Root Directory：** 需要設定為 `frontend/`

## 🔧 Vercel 設定步驟

### 1. 設定 Root Directory

1. 前往 Vercel Dashboard：https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform
2. 點擊 **Settings** → **General**
3. 找到 **Root Directory** 設定
4. 點擊 **Edit**
5. 輸入：`frontend`
6. 點擊 **Save**

### 2. 確認 Build Command

1. 在 **Settings** → **General** 中
2. 找到 **Build and Development Settings**
3. 確認 **Build Command** 為以下之一：
   - `npm run build`（預設，會執行 `prisma db push --skip-generate && prisma generate && next build`）
   - 或 `npm run vercel-build`（明確指定）

### 3. 確認環境變數

前往 **Settings** → **Environment Variables**，確認以下變數已設定：

#### 必須的環境變數

```
DATABASE_URL=postgres://... 或 prisma+postgres://...
JWT_SECRET=your-jwt-secret-key
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
PUSHER_APP_ID=your-pusher-app-id
PUSHER_SECRET=your-pusher-secret
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-pusher-cluster
```

#### 可選的環境變數

```
PRISMA_DATABASE_URL=prisma+postgres://... (如果使用 Prisma Accelerate)
SHARP_IGNORE_GLOBAL_LIBVIPS=1
```

### 4. 觸發部署

#### 方法 1：自動部署（推薦）
1. 推送任何更改到 GitHub `main` 分支
2. Vercel 會自動檢測並觸發部署

#### 方法 2：手動重新部署
1. 前往 **Deployments** 頁面
2. 找到最新的部署
3. 點擊 **⋯** → **Redeploy**

## 📋 構建流程

當 Vercel 部署時，會執行以下步驟：

1. **安裝依賴：** `npm install`
   - 自動執行 `postinstall` 腳本：`prisma generate`

2. **構建：** `npm run build`
   - `prisma db push --skip-generate` - 同步資料庫 schema
   - `prisma generate` - 生成 Prisma Client
   - `next build` - 構建 Next.js 應用

3. **部署：** 將構建結果部署到 Vercel

## ✅ 驗證部署成功

部署完成後，檢查：

1. **構建日誌：**
   - ✅ Prisma schema 同步成功
   - ✅ Prisma Client 生成成功
   - ✅ Next.js 構建成功
   - ✅ 沒有錯誤

2. **網站功能：**
   - ✅ 可以訪問首頁
   - ✅ 可以登入/註冊
   - ✅ 可以查看配對
   - ✅ 可以聊天

## 🔍 故障排除

### 問題 1：構建失敗 - Prisma 錯誤
**解決方案：**
- 確認 `DATABASE_URL` 或 `PRISMA_DATABASE_URL` 正確
- 確認資料庫連接可訪問

### 問題 2：構建失敗 - 找不到模組
**解決方案：**
- 確認 Root Directory 設定為 `frontend/`
- 確認 `package.json` 中的依賴正確

### 問題 3：404 錯誤
**解決方案：**
- 確認 Root Directory 設定正確
- 確認構建成功完成
- 檢查路由配置

### 問題 4：認證失敗
**解決方案：**
- 確認 `JWT_SECRET` 已設定
- 確認資料庫中有用戶資料

## 📝 重要提醒

1. **Root Directory 必須是 `frontend/`**
   - 不是 `final-project/`
   - 不是根目錄 `/`

2. **環境變數必須正確**
   - 特別是 `DATABASE_URL` 和 `JWT_SECRET`

3. **構建命令會自動執行 Prisma 操作**
   - 不需要手動執行 `prisma generate`
   - `postinstall` 腳本會自動執行

4. **備份說明**
   - `final-project/` 目錄保留作為 MongoDB 版本備份
   - 如果需要切換，只需修改 Root Directory

