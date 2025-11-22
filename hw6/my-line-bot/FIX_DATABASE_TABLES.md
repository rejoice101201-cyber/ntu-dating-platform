# 修正資料庫表不存在問題

## 問題

錯誤訊息：
```
The table `public.conversations` does not exist in the current database.
```

這表示：
- ✅ 資料庫連接成功（不再是連接錯誤）
- ❌ 資料庫中沒有建立表結構

## 解決方案

### 方法 1：在 Vercel 部署時自動建立表（已實作）

我已經更新了 `package.json` 的 `build` 腳本：

```json
"build": "prisma generate && prisma db push --skip-generate && next build"
```

這會在每次部署時：
1. 生成 Prisma Client
2. 推送 schema 到資料庫（建立表）
3. 構建 Next.js 應用

### 方法 2：手動執行（如果需要立即建立）

如果您想立即建立表，可以在本地執行：

```bash
cd my-line-bot
npm run db:push
```

**注意**：這需要 `.env.local` 中有正確的 `DATABASE_URL`，指向 Vercel Postgres 資料庫。

### 方法 3：使用 Prisma Migrate（推薦用於生產環境）

如果需要版本控制的 migration：

```bash
# 建立 migration
npm run db:migrate

# 這會建立 prisma/migrations/ 目錄
# 然後在 Vercel 部署時執行：
# prisma migrate deploy
```

## 驗證

部署完成後，檢查 Vercel Function Logs：
- 應該不再看到 "table does not exist" 錯誤
- 應該可以正常連接資料庫並執行查詢

## 下一步

1. ✅ 程式碼已更新（build 腳本包含 `prisma db push`）
2. ⏳ 等待 Vercel 重新部署
3. ⏳ 檢查 Function Logs 確認表已建立
4. ⏳ 測試資料庫功能（對話儲存、速率限制等）

## 如果問題仍然存在

如果部署後仍然看到表不存在的錯誤：

1. **檢查 Vercel Build Logs**：
   - 前往 Deployments → 最新的部署
   - 查看 Build Logs，確認 `prisma db push` 是否成功執行

2. **檢查環境變數**：
   - 確認 `DATABASE_URL` 已正確設定
   - 確認值與 `POSTGRES_URL` 相同

3. **手動執行 migration**：
   - 在本地執行 `npm run db:push`（需要正確的 DATABASE_URL）


