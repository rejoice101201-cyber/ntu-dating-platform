# 修正 DATABASE_URL 問題

## 問題

從錯誤日誌可以看到：
```
Can't reach database server at `7d7558baf8e6b111883181a3d4eb6400f32f7508c6e363ab2397427:5432`
```

這表示 `DATABASE_URL` 環境變數格式不正確，只有主機名部分，缺少完整的連接字串。

## 解決方案

### 步驟 1：檢查 Vercel 環境變數

1. 前往 Vercel Dashboard → 專案 `hw6-bot`
2. Settings → Environment Variables
3. 檢查 `DATABASE_URL` 是否存在

### 步驟 2：設定正確的 DATABASE_URL

如果 `DATABASE_URL` 不存在或格式不正確：

1. **方法 1：複製 POSTGRES_URL**
   - 找到 `POSTGRES_URL` 環境變數
   - 點擊右側的 `...` → `Duplicate`
   - 將新變數名稱改為 `DATABASE_URL`
   - 值保持與 `POSTGRES_URL` 相同
   - Environment: 選擇 `All Environments`
   - 點擊 `Save`

2. **方法 2：手動新增**
   - 點擊 `Add New`
   - Key: `DATABASE_URL`
   - Value: 貼上與 `POSTGRES_URL` 相同的值
   - Environment: `All Environments`
   - 點擊 `Save`

### 步驟 3：確認格式

`DATABASE_URL` 應該是完整的 PostgreSQL 連接字串，格式類似：
```
postgres://username:password@host:port/database?sslmode=require
```

**重要**：確保值中沒有多餘的空格或換行符。

### 步驟 4：重新部署

1. 設定完成後，Vercel 會自動觸發重新部署
2. 或手動前往 Deployments → 點擊最新部署的 `...` → `Redeploy`

### 步驟 5：驗證

部署完成後，檢查 Function Logs：
- 前往 Deployments → 最新的部署
- 點擊 Functions → `/api/webhook`
- 查看 Logs，應該不再有資料庫連接錯誤

## 如果問題仍然存在

1. **檢查 POSTGRES_URL 是否正確**
   - 確認 Vercel Postgres 資料庫是否正常運行
   - 檢查資料庫是否已暫停（免費層級可能有限制）

2. **檢查網路連接**
   - 確認 Vercel 可以訪問資料庫
   - 檢查防火牆設定

3. **暫時禁用資料庫功能**
   - 如果資料庫問題無法立即解決，Bot 會自動使用降級模式
   - 腳本回應功能不受影響
   - LLM 回應功能不受影響（但對話歷史無法儲存）

