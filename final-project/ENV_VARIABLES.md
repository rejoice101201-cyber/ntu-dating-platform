# 環境變數設定指南

## 您提供的環境變數

以下是您提供的環境變數及其用途說明：

### ✅ 需要使用的環境變數

#### 1. Vercel Blob Storage（照片上傳）
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_8sRz3T9Y3XSRnANr_mKu9bjHMigbTQUgpwL3bAFVn4XeAbC
```
- **用途**: 用於照片上傳到 Vercel Blob Storage
- **狀態**: ✅ 已整合到照片上傳功能

#### 2. Image Processing
```env
SHARP_IGNORE_GLOBAL_LIBVIPS=1
```
- **用途**: Sharp 圖像處理庫的設定，避免全域 libvips 衝突
- **狀態**: ✅ 可選，建議設定

### ⚠️ 不需要的環境變數（此專案使用 MongoDB，不是 PostgreSQL）

以下環境變數是 PostgreSQL/Prisma 相關的，**此專案不需要**：

```env
# ❌ 不需要 - 此專案使用 MongoDB
POSTGRES_URL=postgres://...
PRISMA_DATABASE_URL=prisma+postgres://...
DATABASE_URL=postgres://...
```

**說明**: 
- 此專案使用 **MongoDB + Mongoose**，不是 PostgreSQL + Prisma
- 這些環境變數可以忽略或刪除
- 專案需要的是 `MONGODB_URI`（MongoDB 連接字串）

### ❓ 可選的環境變數

#### JWT_SECRET
```env
JWT_SECRET=d0845fef0cebdc1539036fb505b320422842845e72f3811f9737ea31ffa8f740
```
- **用途**: JWT token 簽名（如果使用 JWT）
- **狀態**: ⚠️ 此專案使用 NextAuth，已有 `AUTH_SECRET`
- **建議**: 如果 NextAuth 使用 JWT strategy，可以設定，但通常 `AUTH_SECRET` 已足夠

## 完整的環境變數清單

### 必需環境變數

```env
# Database (MongoDB)
# ⚠️ 重要：連接字串必須包含資料庫名稱 /pikabu
# 格式：...mongodb.net/pikabu?retryWrites=true&w=majority
# 如果沒有指定資料庫，MongoDB 會連線到預設的 test 資料庫
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pikabu?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
AUTH_SECRET=your-generated-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_ID=your-facebook-app-id
FACEBOOK_SECRET=your-facebook-app-secret

# Pusher
NEXT_PUBLIC_PUSHER_APP_KEY=your-pusher-app-key
PUSHER_APP_ID=your-pusher-app-id
PUSHER_SECRET=your-pusher-secret
NEXT_PUBLIC_PUSHER_CLUSTER=ap1

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_8sRz3T9Y3XSRnANr_mKu9bjHMigbTQUgpwL3bAFVn4XeAbC
```

### 可選環境變數

```env
# Image Processing
SHARP_IGNORE_GLOBAL_LIBVIPS=1

# JWT (如果 NextAuth 使用 JWT strategy)
JWT_SECRET=d0845fef0cebdc1539036fb505b320422842845e72f3811f9737ea31ffa8f740
```

## 在 Vercel 中設定環境變數

### 步驟 1: 進入專案設定

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的專案
3. 前往 **Settings** → **Environment Variables**

### 步驟 2: 添加環境變數

對於每個環境變數：

1. 點擊 **Add New**
2. 輸入 **Key**（變數名稱）
3. 輸入 **Value**（變數值）
4. 選擇 **Environment**：
   - **Production**: 生產環境
   - **Preview**: 預覽環境（PR 分支）
   - **Development**: 開發環境
5. 點擊 **Save**

### 步驟 3: 批量添加（使用您提供的值）

可以直接複製以下內容到 Vercel：

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_8sRz3T9Y3XSRnANr_mKu9bjHMigbTQUgpwL3bAFVn4XeAbC
SHARP_IGNORE_GLOBAL_LIBVIPS=1
JWT_SECRET=d0845fef0cebdc1539036fb505b320422842845e72f3811f9737ea31ffa8f740
```

**注意**: 
- 不要添加 PostgreSQL 相關的環境變數（POSTGRES_URL, PRISMA_DATABASE_URL, DATABASE_URL）
- 這些是從其他專案複製來的，此專案不需要

## 環境變數檢查清單

部署前請確認：

- [x] `BLOB_READ_WRITE_TOKEN` - 已提供 ✅
- [x] `SHARP_IGNORE_GLOBAL_LIBVIPS` - 已提供 ✅
- [ ] `MONGODB_URI` - 需要設定（MongoDB Atlas 連接字串）
- [ ] `NEXTAUTH_URL` - 需要設定（Vercel 部署網址）
- [ ] `AUTH_SECRET` - 需要生成
- [ ] `GOOGLE_CLIENT_ID` - 需要設定
- [ ] `GOOGLE_CLIENT_SECRET` - 需要設定
- [ ] `FACEBOOK_ID` - 需要設定
- [ ] `FACEBOOK_SECRET` - 需要設定
- [ ] `NEXT_PUBLIC_PUSHER_APP_KEY` - 需要設定
- [ ] `PUSHER_APP_ID` - 需要設定
- [ ] `PUSHER_SECRET` - 需要設定
- [ ] `NEXT_PUBLIC_PUSHER_CLUSTER` - 需要設定
- [ ] `JWT_SECRET` - 可選（已提供）

## 安全提醒

1. **不要**將環境變數提交到 Git
2. 環境變數中的敏感資訊（如 tokens、secrets）應該保密
3. 定期更新 tokens 和 secrets
4. 使用 Vercel 的環境變數加密功能




