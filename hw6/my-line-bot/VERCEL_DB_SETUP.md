# Vercel 資料庫設定指南

## 關於截圖中的錯誤

從您的截圖可以看到：
- **錯誤訊息**：`This project already has an existing environment variable with name POSTGRES_URL in one of the chosen environments`
- **原因**：Vercel 偵測到專案中已經存在 `POSTGRES_URL` 環境變數

## 解決方案

### 選項 1：使用現有的 POSTGRES_URL（推薦）

既然您已經有 `POSTGRES_URL` 環境變數，最簡單的方法是：

1. **取消這個對話框**（點擊 Cancel）
2. **手動新增 DATABASE_URL**：
   - 前往 Vercel Dashboard → 專案 `hw6-bot`
   - Settings → Environment Variables
   - 找到 `POSTGRES_URL`，點擊右側的 `...` → `Duplicate`
   - 將新變數名稱改為 `DATABASE_URL`
   - 值保持與 `POSTGRES_URL` 相同
   - Environment: 選擇 `All Environments`
   - 點擊 `Save`

### 選項 2：使用不同的前綴（不推薦）

如果您想使用 Vercel 的自動連接功能：

1. **修改 Custom Prefix**：
   - 將 "STORAGE" 改為其他名稱，例如 "DB" 或 "DATABASE"
   - 這樣會生成 `DB_URL` 或 `DATABASE_URL`
   - **注意**：如果選擇 "DATABASE"，會生成 `DATABASE_URL`，但這會與您手動設定的衝突

2. **或者先刪除現有的 POSTGRES_URL**（不推薦，因為可能影響其他功能）

## 關於 .env 文件中的格式

您提到的格式：
```
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
```

這是**範例格式**，不是實際的連接字串。實際的 Vercel Postgres 連接字串格式應該是：
```
postgres://username:password@host:port/database?sslmode=require
```

## 如何取得正確的連接字串

### 方法 1：從 Vercel Postgres 設定中取得

1. 前往 Vercel Dashboard → Storage
2. 點擊 `hw6-db`
3. 進入 **Settings** 或 **.env.local** 分頁
4. 複製 `POSTGRES_URL` 的值
5. 這個值就是您需要的連接字串

### 方法 2：從現有環境變數中取得

1. 前往 Vercel Dashboard → 專案 `hw6-bot`
2. Settings → Environment Variables
3. 找到 `POSTGRES_URL`
4. 點擊眼睛圖示查看值（或複製值）
5. 這個值就是您需要的連接字串

## 正確的設定步驟

### 步驟 1：確認 POSTGRES_URL 存在

在 Vercel 環境變數中確認：
- ✅ `POSTGRES_URL` 存在且值正確
- ✅ `PRISMA_DATABASE_URL` 存在（如果使用 Prisma Accelerate）

### 步驟 2：新增 DATABASE_URL

1. 複製 `POSTGRES_URL` 的值
2. 新增環境變數：
   - Key: `DATABASE_URL`
   - Value: 貼上 `POSTGRES_URL` 的值（完全相同）
   - Environment: `All Environments`
   - 點擊 `Save`

### 步驟 3：驗證

部署完成後，檢查 Function Logs：
- 應該不再看到資料庫連接錯誤
- 應該可以正常連接資料庫

## 關於 .env.local 文件

`.env.local` 文件只用於**本地開發**，不會自動同步到 Vercel。

如果您想在本地測試，需要在 `.env.local` 中設定：
```env
DATABASE_URL="postgres://實際的連接字串"
POSTGRES_URL="postgres://實際的連接字串"
GEMINI_API_KEY="您的 API Key"
CHANNEL_ACCESS_TOKEN="您的 Token"
CHANNEL_SECRET="您的 Secret"
```

**重要**：`.env.local` 中的值應該與 Vercel 環境變數中的值相同（除了本地開發時可能使用不同的資料庫）。

## 總結

1. **取消截圖中的對話框**（因為已經有 POSTGRES_URL）
2. **手動複製 POSTGRES_URL 為 DATABASE_URL**
3. **等待部署完成**
4. **測試資料庫連接**

這樣就可以解決資料庫連接問題了！

