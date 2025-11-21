# Vercel 環境變數修正

## 問題

從錯誤日誌看到：
```
error: Environment variable not found: DATABASE_URL.
```

但您的 Vercel 環境變數中只有：
- `POSTGRES_URL`
- `PRISMA_DATABASE_URL`

## 解決方案

Prisma 需要 `DATABASE_URL` 環境變數。請在 Vercel 中新增：

### 方法 1：複製 POSTGRES_URL 為 DATABASE_URL（推薦）

1. 前往 Vercel Dashboard → 專案 `hw6-bot`
2. Settings → Environment Variables
3. 找到 `POSTGRES_URL`，點擊右側的 `...` → `Duplicate`
4. 將新變數名稱改為 `DATABASE_URL`
5. 值保持與 `POSTGRES_URL` 相同
6. 點擊 `Save`

### 方法 2：直接新增

1. 點擊 `Add New`
2. Key: `DATABASE_URL`
3. Value: 貼上與 `POSTGRES_URL` 相同的值
4. Environment: 選擇 `All Environments`
5. 點擊 `Save`

## 環境變數對照

| Prisma 需要的 | Vercel 中應該有 | 說明 |
|--------------|----------------|------|
| `DATABASE_URL` | ✅ 需要新增 | Prisma 主要使用的變數 |
| - | `POSTGRES_URL` | Vercel Postgres 提供的 |
| - | `PRISMA_DATABASE_URL` | Prisma Accelerate 使用的 |

## 完成後

1. 重新部署（或等待自動部署）
2. 測試資料庫連接
3. 檢查 Function Logs 確認沒有 DATABASE_URL 錯誤

