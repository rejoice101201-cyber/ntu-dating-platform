# Configuration 錯誤修復指南

## 問題分析

從你的終端機日誌可以看到：
- ✅ Google OAuth callback 有收到 code（line 985）
- ❌ 但返回了 Configuration 錯誤（line 986）

這表示 NextAuth 在處理 callback 時出現配置問題。

## 可能的原因

1. **開發伺服器沒有重啟**：更新 `.env.local` 後必須重啟
2. **Secret 沒有正確讀取**：NextAuth v5 可能需要 `AUTH_SECRET` 而不是 `NEXTAUTH_SECRET`
3. **PrismaAdapter 配置問題**：資料庫連線或 schema 問題

## 修復步驟

### 步驟 1: 檢查終端機日誌

查看運行 `npm run dev` 的終端機，尋找：
- `[NextAuth] Missing environment variables` 錯誤
- `[NextAuth] AUTH_SECRET is missing` 錯誤
- `[NextAuth] AUTH_SECRET is set` 訊息

### 步驟 2: 添加 AUTH_SECRET 環境變數

NextAuth v5 優先使用 `AUTH_SECRET`，請在 `.env.local` 中添加：

```env
AUTH_SECRET="zKOtP/20azg62Iu9q8rZIG3nz8nS9Ms64UxuH4EBcww="
```

或者直接複製 `NEXTAUTH_SECRET` 的值：

```bash
# 在 .env.local 中添加這一行
AUTH_SECRET="zKOtP/20azg62Iu9q8rZIG3nz8nS9Ms64UxuH4EBcww="
```

### 步驟 3: 重啟開發伺服器

**非常重要**：更新 `.env.local` 後必須重啟！

```bash
# 停止當前伺服器（按 Ctrl+C）
# 然後重新啟動
npm run dev
```

### 步驟 4: 檢查啟動日誌

重啟後，查看終端機輸出，應該看到：
```
[NextAuth] AUTH_SECRET is set (length: 44)
```

如果看到：
```
[NextAuth] AUTH_SECRET is missing! This will cause Configuration errors.
```

表示環境變數沒有正確讀取。

### 步驟 5: 驗證資料庫 Schema

確認 Prisma schema 包含 NextAuth 需要的所有表：

```bash
npx prisma migrate status
```

如果資料庫不是最新的，執行：

```bash
npx prisma migrate dev
npx prisma generate
```

## 快速修復命令

執行以下命令自動添加 `AUTH_SECRET`：

```bash
cd /home/denny/下載/網路服務程式設計/wp1141/hw5
echo 'AUTH_SECRET="zKOtP/20azg62Iu9q8rZIG3nz8nS9Ms64UxuH4EBcww="' >> .env.local
```

然後重啟開發伺服器。

## 驗證修復

修復後，再次嘗試 Google 登入：

1. 清除瀏覽器 cookies
2. 訪問：http://localhost:3000/auth/signin
3. 點擊「使用 Google 註冊 / 登入」
4. 應該能正常跳轉並完成登入

## 如果還是不行

請提供：
1. 重啟後的終端機完整啟動日誌（特別是 `[NextAuth]` 開頭的訊息）
2. 執行 `npm run debug-oauth` 的完整輸出
3. 瀏覽器 Network 分頁中 `/api/auth/callback/google` 請求的 Response 內容

