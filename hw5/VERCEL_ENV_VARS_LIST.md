# Vercel 環境變數清單

## 必須設置的環境變數（Production）

在 Vercel Dashboard → Settings → Environment Variables 中，設置以下環境變數：

### OAuth Providers（必需）

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_ID
GITHUB_SECRET
FACEBOOK_ID
FACEBOOK_SECRET
```

### NextAuth 配置（必需）

```
AUTH_SECRET
NEXTAUTH_URL
```

**注意**：
- `AUTH_SECRET` 是 NextAuth v5 的標準名稱（優先使用）
- `NEXTAUTH_URL` 必須設置為：`https://wp1141-azure.vercel.app`

### 資料庫（必需）

```
DATABASE_URL
```

### Pusher（可選，用於即時更新）

```
NEXT_PUBLIC_PUSHER_APP_KEY
NEXT_PUBLIC_PUSHER_CLUSTER
PUSHER_APP_ID
PUSHER_SECRET
```

---

## 完整清單（複製用）

### 必需環境變數（9 個）

1. `GOOGLE_CLIENT_ID`
2. `GOOGLE_CLIENT_SECRET`
3. `GITHUB_ID`
4. `GITHUB_SECRET`
5. `FACEBOOK_ID`
6. `FACEBOOK_SECRET`
7. `AUTH_SECRET`
8. `NEXTAUTH_URL`
9. `DATABASE_URL`

### 可選環境變數（4 個）

10. `NEXT_PUBLIC_PUSHER_APP_KEY`
11. `NEXT_PUBLIC_PUSHER_CLUSTER`
12. `PUSHER_APP_ID`
13. `PUSHER_SECRET`

---

## 快速檢查清單

在 Vercel Dashboard 中確認以下環境變數都已設置：

### OAuth Providers
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GITHUB_ID`
- [ ] `GITHUB_SECRET`
- [ ] `FACEBOOK_ID`
- [ ] `FACEBOOK_SECRET`

### NextAuth
- [ ] `AUTH_SECRET`
- [ ] `NEXTAUTH_URL` = `https://wp1141-azure.vercel.app`

### 資料庫
- [ ] `DATABASE_URL`

### Pusher（可選）
- [ ] `NEXT_PUBLIC_PUSHER_APP_KEY`
- [ ] `NEXT_PUBLIC_PUSHER_CLUSTER`
- [ ] `PUSHER_APP_ID`
- [ ] `PUSHER_SECRET`

---

## 重要提醒

1. **環境選擇**：所有變數都必須設置在 **Production** 環境
2. **格式要求**：
   - 不要使用引號（除非值包含空格）
   - 不要有多餘的空格
   - 正確格式：`KEY=value`
   - 錯誤格式：`KEY="value"` 或 `KEY = value`
3. **NEXTAUTH_URL**：必須設置為 `https://wp1141-azure.vercel.app`（不要使用 `http://` 或 `localhost`）

---

## 設置步驟

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇專案：`wp1141`
3. 前往 **Settings** → **Environment Variables**
4. 點擊 **Add New** 添加每個環境變數
5. 選擇 **Production** 環境
6. 輸入 Key 和 Value
7. 點擊 **Save**
8. 重複步驟 4-7 添加所有環境變數
9. 前往 **Deployments** 頁面重新部署

---

## 驗證

部署後，檢查 Vercel Function Logs，應該看到：

```
[NextAuth] AUTH_SECRET is set (length: 44)
[NextAuth] Enabled providers: [ 'google', 'github', 'facebook' ]
[NextAuth] Successfully configured 3 OAuth provider(s)
```

如果看到錯誤，檢查環境變數是否正確設置。

