# 測試指南

## 測試前準備

### 1. 環境變數設定

確保 `.env.local` 檔案包含以下變數：

```bash
# Line Bot 設定
CHANNEL_ACCESS_TOKEN=您的_Channel_Access_Token
CHANNEL_SECRET=您的_Channel_Secret

# Google Gemini API 設定
GEMINI_API_KEY=您的_Gemini_API_Key

# 資料庫設定（Vercel Postgres）
DATABASE_URL=您的_Postgres_連接字串
```

**注意**：Prisma 使用 `DATABASE_URL`，不是 `POSTGRES_URL` 或 `PRISMA_DATABASE_URL`。

### 2. 資料庫遷移

在本地測試前，需要先建立資料表：

```bash
# 方法 1：直接推送 schema（開發環境）
npm run db:push

# 方法 2：建立 migration（生產環境）
npm run db:migrate
```

## 測試步驟

### 測試 1：健康檢查端點

```bash
# 啟動開發伺服器
npm run dev

# 在另一個終端測試
curl http://localhost:3000/api/webhook
```

**預期結果**：
```json
{
  "message": "Line Bot Webhook is running",
  "timestamp": "2024-11-21T..."
}
```

### 測試 2：腳本服務測試

建立測試檔案 `test-script.ts`：

```typescript
import { matchKeyword, getScriptResponse, handleScriptResponse } from './lib/services/scriptService';

// 測試關鍵字匹配
console.log('測試關鍵字匹配:');
console.log('地址', matchKeyword('地址在哪裡')); // 應該返回 'clinic_info'
console.log('服務', matchKeyword('有什麼服務')); // 應該返回 'service_info'
console.log('預約', matchKeyword('我想預約')); // 應該返回 'appointment'

// 測試腳本回應
console.log('\n測試腳本回應:');
const response = handleScriptResponse('地址在哪裡');
console.log(response);
```

執行：
```bash
npx tsx test-script.ts
```

### 測試 3：速率限制測試

建立測試檔案 `test-rate-limit.ts`：

```typescript
import { checkRateLimit } from './lib/services/rateLimitService';

async function test() {
  const userId = 'test-user-123';
  
  for (let i = 0; i < 5; i++) {
    const result = await checkRateLimit(userId);
    console.log(`請求 ${i + 1}:`, result);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

test();
```

### 測試 4：Line Webhook 測試（使用 ngrok 或類似工具）

1. **啟動本地伺服器**：
```bash
npm run dev
```

2. **使用 ngrok 建立隧道**：
```bash
ngrok http 3000
```

3. **在 Line Developers Console 設定 Webhook URL**：
   - 前往 [LINE Developers Console](https://developers.line.biz/console/)
   - 選擇您的 Channel
   - 進入 "Messaging API" 分頁
   - 設定 Webhook URL：`https://your-ngrok-url.ngrok.io/api/webhook`
   - 點擊 "Verify"

4. **使用手機 Line 測試**：
   - 掃描 QR Code 加入好友
   - 發送訊息測試

### 測試 5：資料庫操作測試

```bash
# 啟動 Prisma Studio（可視化資料庫）
npm run db:studio
```

在瀏覽器中開啟 `http://localhost:5555`，可以：
- 查看 conversations 表
- 查看 messages 表
- 查看 rate_limits 表
- 手動新增/編輯資料

## 測試場景

### 場景 1：使用者加入好友
1. 掃描 QR Code 加入好友
2. **預期**：收到歡迎訊息和選單

### 場景 2：詢問診所資訊
1. 發送「地址在哪裡」
2. **預期**：收到診所資訊腳本回應（地址、電話、交通）

### 場景 3：詢問服務項目
1. 發送「有什麼服務」
2. **預期**：收到服務項目列表

### 場景 4：複雜問題（LLM 處理）
1. 發送「我最近皮膚很敏感，不知道適不適合做雷射？」
2. **預期**：收到 LLM 生成的專業回應

### 場景 5：速率限制
1. 快速連續發送 5 則訊息（1 分鐘內）
2. **預期**：前 3 則正常回應，後 2 則收到速率限制提示

### 場景 6：錯誤處理
1. 暫時關閉 Gemini API（或使用錯誤的 API Key）
2. 發送無法匹配關鍵字的訊息
3. **預期**：收到降級回應，建議致電診所

## 檢查清單

- [ ] 環境變數已正確設定
- [ ] 資料庫連接成功（`npm run db:push` 成功）
- [ ] 健康檢查端點正常（`/api/webhook` GET 請求）
- [ ] 腳本服務正常（關鍵字匹配和回應）
- [ ] Line Webhook 驗證成功
- [ ] 可以接收和回應訊息
- [ ] 對話記錄儲存到資料庫
- [ ] 速率限制正常運作
- [ ] LLM 回應正常（或降級機制正常）

## 常見問題

### Q: 資料庫連接失敗
**A**: 檢查 `DATABASE_URL` 是否正確，格式應為：
```
postgresql://user:password@host:port/database?sslmode=require
```

### Q: Prisma Client 未生成
**A**: 執行 `npm run db:generate`

### Q: Line Webhook 驗證失敗
**A**: 
1. 檢查 `CHANNEL_SECRET` 是否正確
2. 確認 Webhook URL 是 HTTPS
3. 檢查伺服器日誌是否有錯誤

### Q: LLM 回應失敗
**A**: 
1. 檢查 `GEMINI_API_KEY` 是否正確
2. 檢查 API 配額是否用完
3. 查看伺服器日誌錯誤訊息

